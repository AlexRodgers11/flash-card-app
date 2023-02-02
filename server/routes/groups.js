import express from "express";
const groupRouter = express.Router();
import mongoose from "mongoose";

import Activity from "../models/activity.js";
import { Card } from "../models/card.js";
import Deck from "../models/deck.js";
import Group from "../models/group.js";
import { DeckSubmission, JoinRequest } from "../models/message.js";
import { AdminChangeNotification, DeckAddedNotification, GroupDeletedNotification, HeadAdminChangeNotification, NewMemberJoinedNotification, RemovedFromGroupNotification } from "../models/notification.js";
import User from "../models/user.js";
import { copyDeck, swapIndexes } from "../utils.js";

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

groupRouter.get("/:groupId", (req, res, next) => {
    let response;
    if(req.query.tile) {
        response = {
            name: req.group.name,
            memberCount: req.group.members.length,
            deckCount: req.group.decks.length
        }
    } else if(req.query.requestingUser) {
        if(!req.group.administrators.includes(req.query.requestingUser)) {
            req.group.joinCode = 'only admins can view join codes';
        } else if(!req.group.members.includes(req.query.requestingUser)) {
            res.status(401).send("Unauthorized: Only members of this group may view its page");
        }
        response = req.group;
    } else {
        res.status(401).send("Unauthorized: Only members of this group may view its page");
    }
    res.status(200).send(response);
});

groupRouter.get("/:groupId/join-options", (req, res, next) => {
    res.status(200).send({
        joinOptions: req.group.joinOptions
    })
});

groupRouter.get("/:groupId/decks", (req, res, next) => {
    res.status(200).send(JSON.stringify(req.group.decks));
});


groupRouter.post("/:groupId/decks", async (req, res, next) => {
    try {
        const deckCopy = await copyDeck(req.body.deckId);
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
        const deckCopy = await copyDeck(req.body.deckId);
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

//Patch? Delete? If Patch should I use the same route for adding and removing members and do logic to decide whether to push or pull in update obj?
groupRouter.patch("/:groupId/members", async (req, res, next) => {
    //necessary to do this check since it would take Postman or something to send a request with a member Id not in the group?
    if(req.group.members.includes(req.body.memberToRemoveId)) {
        //Is this truly secure? Admin ids are exposed in devtools...
        try {
            let updatedUser;
            //process the removalif either the requesting user is the one to be deleted or the requesting user is a group admin
            if(req.body.requesterId === req.body.memberToRemoveId || req.group.members.includes(mongoose.Types.ObjectId(req.body.requesterId))) {
                await Group.findByIdAndUpdate(req.group._id, {$pull: {members: req.body.memberToRemoveId, administrators: req.body.memberToRemoveId}});
                updatedUser = await User.findByIdAndUpdate(req.body.memberToRemoveId, {$pull: {groups: req.group._id, adminOf: req.group._id}});
                
                //if the user is being removed by an admin (other than an admin removing themselves) send a notification to the removed user
                if(req.body.requesterId !== req.body.memberToRemoveId) {
                    await User.findByIdAndUpdate(updatedUser._id, {$push: {notifications: await RemovedFromGroupNotification.create({targetGroup: req.group._id, decidingUser: req.body.requesterId, read: false})}});
                }
                res.status(200).send(updatedUser._id);
            } else {
                res.status(403).send("You do not have the authority to remove this member");
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

groupRouter.post("/:groupId/messages/admin/join-request", async (req, res, next) => {
    try {
        const foundGroup = await Group.findById(req.body.targetGroup, "administrators");
        const newMessage = new JoinRequest({
            acceptanceStatus: 'pending',
            sendingUser: req.body.sendingUser,
            receivingUsers: foundGroup.administrators,
            targetGroup: req.body.targetGroup,
        });
            
        const savedMessage = await newMessage.save();
        await User.updateMany({_id: {$in: req.group.administrators}}, {$push: {'messages.received': savedMessage}});
        await User.findByIdAndUpdate(req.body.sendingUser, {$push: {'messages.sent': savedMessage}});

        res.status(200).send({_id: savedMessage._id, messageType: "JoinRequest", read: []});
    } catch(err) {
        res.status(500).send("There was an error sending the join request to the group admins");
    }
});

groupRouter.post("/:groupId/messages/admin/deck-submission", async (req, res, next) => {
    try {
        //create a copy of the deck that will either be added to the group upon approval or deleted upon rejection (this way original deck edits don't affect submitted)
        const deckCopy = await copyDeck(req.body.deckToCopy);
        deckCopy.groupDeckBelongsTo = req.group._id;
        deckCopy.approvedByGroupAdmins = false,
        deckCopy.deckCopiedFrom = req.body.deckToCopy;
        const savedDeckCopy = await deckCopy.save();
        const foundGroup = await Group.findById(req.body.targetGroup, "administrators");

        const newMessage = new DeckSubmission({
            acceptanceStatus: 'pending',
            sendingUser: req.body.sendingUser,
            receivingUsers: foundGroup.administrators,
            targetDeck: savedDeckCopy._id,
            targetGroup: req.body.targetGroup,
            deckName: savedDeckCopy.name,
        });
        const savedMessage = await newMessage.save();
        await User.updateMany({_id: {$in: req.group.administrators}}, {$push: {'messages.received': savedMessage}});
        await User.findByIdAndUpdate(req.body.sendingUser, {$push: {'messages.sent': savedMessage}});

        res.status(200).send({_id: savedMessage._id, messageType: "DeckSubmission", read: []});
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

// groupRouter.delete("/:groupId", (req, res, next) => {
//     Group.findByIdAndDelete(req.group._id, (err, group) => {
//         if(err) {
//             res.status(500).send("There was an error with your request");
//             throw err
//         }
//         else {
//             Deck.deleteMany({_id: {$in: req.group.decks}}, (err, deckDeleteResponse) => {
//                 if(err) {
//                     res.status(500).send("There was an error deleting group's decks");
//                     throw err;
//                 }
//                 //change activity to activities
//                 Activity.deleteMany({_id: {$in: req.group.activity}}, (err, activityDeleteResponse) => {
//                     if(err) {
//                         res.status(500).send("There was an error deleting group's activities")
//                         throw err;
//                     }
//                     User.updateMany({_id: {$in: req.group.members}}, {$pull: {groups: req.group._id}}, (err, memberDeleteResponse) => {
//                         if(err) {
//                             res.status(500).send("There was an error removing the group from its member's groups arrays");
//                             throw err;
//                         }
//                         User.updateMany({_id: {$in: req.group.administrators}}, {$pull: {adminOf: req.group._id}}, (err, adminDeleteResponse) => {
//                             if(err) {
//                                 res.status(500).send("There was an error removing the group from its administrators' adminOf arrays");
//                                 throw err;
//                             }
//                         });
//                     });
//                 });
//             })
//             res.status(200).send(group);
//         }
//     });
// });

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