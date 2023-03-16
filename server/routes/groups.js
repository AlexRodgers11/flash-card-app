import express from "express";
const groupRouter = express.Router();
import mongoose from "mongoose";

import { Card } from "../models/card.js";
import Deck from "../models/deck.js";
import Group from "../models/group.js";
import { DeckSubmission, JoinRequest } from "../models/message.js";
import { AdminChangeNotification, DeckAddedNotification, GroupDeletedNotification, HeadAdminChangeNotification, NewMemberJoinedNotification, RemovedFromGroupNotification } from "../models/notification.js";
import User from "../models/user.js";
import { copyDeck, getUserIdFromJWTToken, swapIndexes } from "../utils.js";

groupRouter.param("groupId", (req, res, next, groupId) => {
    Group.findById(groupId, (err, group) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else if(!group) {
            res.status(404).send("Group not found");
        } else {
            req.group = group;
            next();
        }
    });
});

groupRouter.get("/search", async (req, res, next) => {
    const regex = new RegExp(req.query.entry, 'i');
    const user = await User.findById(req.query.id, "groups messages.sent");
    let populatedUser = await user.populate("messages.sent");
    let groups = await Group.find({name: {$regex: regex}});
    let filteredGroups = groups.filter(group => !populatedUser.groups.includes(group._id) && !populatedUser.messages.sent.map(message => message.targetGroup.toString()).includes(group._id.toString()));
    res.status(200).send(filteredGroups);
});

groupRouter.get("/:groupId", getUserIdFromJWTToken, (req, res, next) => {
    if(!req.group.members.includes(req.userId)) {
        res.status(403).send("You must be a user of a group to retrieve its information");
        return;
    }
    let response;   
    if(req.query.tile) {
        response = {
            name: req.group.name,
            // memberCount: req.group.members.length,
            memberIds: req.group.members,
            deckCount: req.group.decks.length
        }
    } else {
        response = req.group;
        if(!req.group.administrators.includes(req.userId)) {
            delete response.joinCode;
        } 
        response = req.group;
    } 
    res.status(200).send(response);
});

groupRouter.get("/:groupId/join-options", (req, res, next) => {
    res.status(200).send({
        joinOptions: req.group.joinOptions
    })
});

groupRouter.get("/:groupId/decks", getUserIdFromJWTToken, async (req, res, next) => {
    if(!req.group.members.map(id => id.toString()).includes(req.userId)) {
        const populatedGroup = await req.group.populate("decks", "publiclyAvailable");
        const publicDecks = populatedGroup.decks.filter(deck => deck.publiclyAvailable).map(deck => deck._id);
        res.status(200).send(publicDecks); 
    } else {
        res.status(200).send(req.group.decks);
    }
});


groupRouter.post("/:groupId/decks", async (req, res, next) => {
    try {
        const deckCopy = await copyDeck(req.body.deckId, req.group._id);
        deckCopy.groupDeckBelongsTo = req.group._id;
        deckCopy.approvedByGroupAdmins = true,
        deckCopy.deckCopiedFrom = req.body.deckId;
        const savedDeckCopy = await deckCopy.save();
        const updatedGroup = await Group.findByIdAndUpdate(req.group._id, {$push: {decks: savedDeckCopy}}); 
        //possibly exclude the approver's id

        const otherGroupMembers = updatedGroup.members.filter(memberId => memberId.toString() !== req.body.adminId);

        await User.updateMany({_id: {$in: otherGroupMembers}}, {$push: {notifications: await DeckAddedNotification.create({targetDeck: savedDeckCopy._id, targetGroup: updatedGroup._id, read: false})}});
        res.status(200).send(savedDeckCopy._id);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

groupRouter.patch("/:groupId/decks", async (req, res, next) => {
    try {
        const deckCopy = await copyDeck(req.body.deckId, req.group._id);
        await Group.findByIdAndUpdate(req.group._id, {$push: {decks: deckCopy}});
        res.status(200).send({submittedDeckId: deckCopy._id, submittedDeckName: deckCopy.name});
    } catch (err) {
        res.status(500).send(err.message);
    }
});


groupRouter.patch("/:groupId/head-admin", async (req, res, next) => {
    try {
        const newHeadAdminIdx = req.group.administrators.indexOf(req.body.newAdminId);
        const newAdministrators = req.group.administrators.slice();
        const prevAdminId = req.group.administrators[0];
        if(newHeadAdminIdx > 0) {//start here- make sure if mbr wasn't an admin making them head admin places them at the front of the member list and admin list
            swapIndexes(newAdministrators, 0, newHeadAdminIdx);
            newAdministrators.splice(newHeadAdminIdx, 1);
        } else {
            newAdministrators.shift();
            newAdministrators.unshift(req.body.newAdminId);
        }
        await User.findByIdAndUpdate(req.body.newAdminId, {$push: {adminOf: req.group._id}});
        await User.findByIdAndUpdate(prevAdminId, {$pull: {adminOf: req.group._id, groups: req.group._id}});
        const updatedGroup = await Group.findByIdAndUpdate(req.group._id, {$set: {administrators: newAdministrators}, $pull: {members: prevAdminId}},  {new: true});
        // const otherGroupMembers = updatedGroup.members.filter(memberId => memberId.toString() !== req.body.newAdminId);
        let reorderedGroupMembers = [...updatedGroup.members].sort((a, b) => {
            if(a.toString() === req.body.newAdminId) {
                return -1;
            } else if (b.toString() === req.body.newAdminId) {
                return 1;
            } else if (updatedGroup.administrators.includes(a)) {
                if(updatedGroup.administrators.includes(b)) {
                    return 0
                } 
                return -1; 
            } else if(updatedGroup.administrators.includes(b)) {
                return 1;
            }
            return 0;
        });
        await Group.findByIdAndUpdate(req.group._id, {$set: {members: reorderedGroupMembers}});

        await User.updateMany({_id: {$in: updatedGroup.members}}, {$push: {notifications: await HeadAdminChangeNotification.create({targetGroup: updatedGroup._id, previousHeadAdmin: prevAdminId, newHeadAdmin: req.body.newAdminId, read: false})}});
        res.status(200).send({
            administrators: updatedGroup.administrators,
            members: updatedGroup.members
        });
    } catch (err) {
        res.status(500).send(err.message);
        throw err;
    }
});

groupRouter.patch("/:groupId/members", getUserIdFromJWTToken, async (req, res, next) => {
    //necessary to do this check since it would take Postman or something to send a request with a member Id not in the group?
    if(req.group.members.includes(req.body.memberToRemoveId)) {
        try {
            let updatedUser;
            //process the removal if either the requesting user is the one to be deleted or the requesting user is a group admin
            if(req.userId.toString() === req.body.memberToRemoveId || req.group.administrators.some(id => id.toString() === req.userId.toString())) {
                await Group.findByIdAndUpdate(req.group._id, {$pull: {members: req.body.memberToRemoveId, administrators: req.body.memberToRemoveId}});
                updatedUser = await User.findByIdAndUpdate(req.body.memberToRemoveId, {$pull: {groups: req.group._id, adminOf: req.group._id}});
                
                //if the user is being removed by an admin (other than an admin removing themselves) send a notification to the removed user
                if(req.userId.toString() !== req.body.memberToRemoveId) {
                    await User.findByIdAndUpdate(updatedUser._id, {$push: {notifications: await RemovedFromGroupNotification.create({targetGroup: req.group._id, decidingUser: req.userId, read: false})}});
                }
                res.status(200).send(updatedUser._id);
            } else {
                res.status(401).send("You do not have the authority to remove this member");
            }
        } catch (err) {
            console.error(err);
            res.status(500).send(err.message);
        }
    } else {
        res.status(404).send("Cannot remove member because member not found");
    }
});

groupRouter.patch("/:groupId/admins", async (req, res, next) => {
    if(req.group.administrators.includes(req.body.adminId)) {
        try {
            let user = await User.findById(req.body.memberId);
            if(user && req.group.members.includes(user._id)) {
                let updatedGroup;
                let updatedUser;
                if(req.body.action === "grant") {
                    updatedGroup = await Group.findByIdAndUpdate(req.group._id, {$push: {administrators: user._id}}, {new: true});
                    updatedUser = await User.findByIdAndUpdate(user._id, {$push: {adminOf: req.group._id}});
                } else if(req.body.action === "revoke") {
                    updatedGroup = await Group.findByIdAndUpdate(req.group._id, {$pull: {administrators: user._id}}, {new: true});
                    updatedUser = await User.findByIdAndUpdate(user._id, {$pull: {adminOf: req.group._id}});
                } else {
                    res.status(500).send("There was an error with your request");
                }
                let reorderedGroupMembers = [...updatedGroup.members].sort((a, b) => {
                    if(a === updatedGroup.administrators[0]) {
                        return -1;
                    } else if (b === updatedGroup.administrators[0]) {
                        return 1;
                    } else if (updatedGroup.administrators.includes(a)) {
                        if(updatedGroup.administrators.includes(b)) {
                            return 0
                        } 
                        return -1; 
                    } else if(updatedGroup.administrators.includes(b)) {
                        return 1;
                    }
                    return 0;
                });
                
                await Group.findByIdAndUpdate(req.group._id, {members: reorderedGroupMembers});

                await User.findByIdAndUpdate(user._id, {$push: {notifications: await AdminChangeNotification.create({targetGroup: req.group._id, decidingUser: req.body.adminId, action: req.body.action, read: false})}});

                res.status(200).send({userId: updatedUser._id, members: reorderedGroupMembers});
            } else {
                res.status(404).send("User not found in selected group");
            }
        } catch (err) {
            res.status(500).send(err.message);
            throw err;
        }
    } else {
        res.status(403).send("Only authorized users can designate adminstrator authority");
    }
});

groupRouter.post("/:groupId/messages/admin/join-request", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        const foundGroup = await Group.findById(req.body.targetGroup, "administrators");
        //any need to make sure user not already a user? 
        const newMessage = new JoinRequest({
            acceptanceStatus: 'pending',
            sendingUser: req.userId,
            receivingUsers: foundGroup.administrators,
            targetGroup: req.body.targetGroup,
        });
            
        const savedMessage = await newMessage.save();
        await User.updateMany({_id: {$in: req.group.administrators}}, {$push: {'messages.received': savedMessage}});
        await User.findByIdAndUpdate(req.userId, {$push: {'messages.sent': savedMessage}});

        res.status(200).send({_id: savedMessage._id, messageType: "JoinRequest", read: []});
    } catch(err) {
        res.status(500).send("There was an error sending the join request to the group admins");
    }
});

groupRouter.post("/:groupId/messages/admin/deck-submission", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        const foundUser = await User.findById(req.userId, "_id decks groups");
        
        if(!foundUser.decks.map(deck => deck.toString()).includes(req.body.deckToCopy)) {
            res.status(403).send("Only the creator of a deck may submit it to a group");
        } else if(!foundUser.groups.map(group => group.toString()).includes(req.body.targetGroup)) {
            res.status(403).send("Only a member of a group may submit a deck to be added to it");
        } else {

            //create a copy of the deck that will either be added to the group upon approval or deleted upon rejection (this way original deck edits don't affect submitted)
            const deckCopy = await copyDeck(req.body.deckToCopy, req.group._id);
            deckCopy.groupDeckBelongsTo = req.group._id;
            deckCopy.approvedByGroupAdmins = false,
            deckCopy.deckCopiedFrom = req.body.deckToCopy;
            const savedDeckCopy = await deckCopy.save();
            const foundGroup = await Group.findById(req.body.targetGroup, "administrators");

            const newMessage = new DeckSubmission({
                acceptanceStatus: 'pending',
                // sendingUser: req.body.sendingUser,
                sendingUser: req.userId,
                receivingUsers: foundGroup.administrators,
                targetDeck: savedDeckCopy._id,
                targetGroup: req.body.targetGroup,
                deckName: savedDeckCopy.name,
            });
            const savedMessage = await newMessage.save();
            await User.updateMany({_id: {$in: req.group.administrators}}, {$push: {'messages.received': savedMessage}});
            // await User.findByIdAndUpdate(req.body.sendingUser, {$push: {'messages.sent': savedMessage}});
            await User.findByIdAndUpdate(req.userId, {$push: {'messages.sent': savedMessage}});

            res.status(200).send({_id: savedMessage._id, messageType: "DeckSubmission", read: []});
        }
    } catch (err) {
        res.status(500).send("There was an error updating receiving admins received messages");
        throw err;
    }
});

groupRouter.delete("/:groupId", async (req, res, next) => {
    try {
        if(req.query.requestingUser === req.group.administrators[0].toString()) {
            const group = await Group.findByIdAndDelete(req.group._id);

            for (let i = 0; i < req.group.decks.length; i++) {
                let deck = await Deck.findById(req.group.decks[i]);
                await Card.deleteMany({_id: {$in: deck.cards}});
            }
            await Deck.deleteMany({_id: {$in: req.group.decks}});

            await Activity.deleteMany({_id: {$in: req.group.activities}});

            await User.updateMany({_id: {$in: req.group.members}}, {$pull: {groups: req.group._id}});

            await User.updateMany({_id: {$in: req.group.administrators}}, {$pull: {adminOf: req.group._id}});

            const otherGroupMembers = req.group.members.filter(memberId => memberId.toString() !== req.query.requestingUser);

            await User.updateMany({_id: {$in: otherGroupMembers}}, {$push: {notifications: await GroupDeletedNotification.create({groupName: req.group.name, read: false})}});

            res.status(200).send(group);
        } else {
            res.status(403).send("Only the head administrator of a group may delete the group");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("There was an error with your request");
        throw err
    }
});

groupRouter.put("/:groupId", (req, res, next) => {
    Group.findByIdAndUpdate(req.group._id, req.body, {new:true}, (err, group) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(group);
        }
    });
});

// groupRouter.post("/:groupId/members", async (req, res, next) => {
//     try {
//         const user = await User.findById(req.body.userId);
//         await Group.findByIdAndUpdate(req.group._id, {$addToSet: {members: user._id}});
//         res.status(200).send(user._id);
//     } catch (err) {
//         res.status(500).send("There was an error with your request");
//         throw err;
//     }
// });

groupRouter.post("/:groupId/members/join-code", async(req, res, next) => {
    try {
        const user = await User.findById(req.body.userId);
        const foundGroup = await Group.findById(req.group._id, "members");
        if((user && foundGroup) && (req.body.joinCode === req.group.joinCode)) {
            const updatedGroup = await Group.findByIdAndUpdate(req.group._id, {$addToSet: {members: user._id}}, {new: true});
            await User.findByIdAndUpdate(req.body.userId, {$addToSet: {groups: updatedGroup._id}});
            await User.updateMany({_id: {$in: foundGroup.members}}, {$push: {notifications: await NewMemberJoinedNotification.create({member: req.body.userId, targetGroup: updatedGroup._id, read: false})}});
            res.status(200).send(updatedGroup._id);
        } else {
            res.status(404).send("Invalid join code");
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("There was an error with your request");
    }
});

export default groupRouter;