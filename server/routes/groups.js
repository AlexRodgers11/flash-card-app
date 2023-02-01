import express from "express";
const groupRouter = express.Router();

import Activity from "../models/activity.js";
import { Card } from "../models/card.js";
import Deck from "../models/deck.js";
import Group from "../models/group.js";
import { DeckSubmission, JoinRequest } from "../models/message.js";
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
        console.log({deckCopy});
        await Group.findByIdAndUpdate(req.group._id, {$push: {decks: deckCopy}});
        res.status(200).send({submittedDeckId: deckCopy._id, submittedDeckName: deckCopy.name});
    } catch (err) {
        res.status(500).send(err.message);
    }
});


groupRouter.patch("/:groupId/head-admin", async (req, res, next) => {
    try {
        let newAdminIdx = req.group.administrators.indexOf(req.body.newAdminId);
        let newAdministrators = req.group.administrators.slice();
        let prevAdmin = req.group.administrators[0];
        if(newAdminIdx > 0) {
            swapIndexes(newAdministrators, 0, newAdminIdx);
            newAdministrators.splice(newAdminIdx, 1);
        } else {
            newAdministrators.shift();
            newAdministrators.unshift(req.body.newAdminId);
        }
        await User.findByIdAndUpdate(req.body.newAdminId, {$push: {adminOf: req.group._id}});
        await User.findByIdAndUpdate(prevAdmin, {$pull: {adminOf: req.group._id, groups: req.group._id}});
        let updatedGroup = await Group.findByIdAndUpdate(req.group._id, {$set: {administrators: newAdministrators}, $pull: {members: prevAdmin}},  {new: true});
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
        //also, may need to split this into two ifs so notification can be sent if an admin removes a group member
        if(req.group.members.includes(req.body.requesterId) || req.group.administrators.includes(req.body.requesterId)) {
            try {
                await Group.findByIdAndUpdate(req.group._id, {$pull: {members: req.body.memberToRemoveId, administrators: req.body.memberToRemoveId}});
                const updatedUser = await User.findByIdAndUpdate(req.body.memberToRemoveId, {$pull: {groups: req.group._id, adminOf: req.group._id}});
                res.status(200).send(updatedUser._id);
            } catch (err) {
                res.status(500).send(err.message);
                throw err;
            }
        } else {
            res.status(403).send("You do not have the authority to remove this member");
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
                    //need to create notification here eventually and possibly an activity
                    updatedGroup = await Group.findByIdAndUpdate(req.group._id, {$push: {administrators: user._id}}, {new: true});
                    updatedUser = await User.findByIdAndUpdate(user._id, {$push: {adminOf: req.group._id}});
                } else if(req.body.action === "revoke") {
                    //need to create notification here eventually
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
    console.log({body: req.body});
    try {
        const newMessage = new JoinRequest({
            acceptanceStatus: 'pending',
            sendingUser: req.body.sendingUser,
            targetGroup: req.body.targetGroup,
        });
            
        const savedMessage = await newMessage.save();
        console.log({savedMessage});
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
        console.log({deckCopy});
        deckCopy.groupDeckBelongsTo = req.group._id;
        deckCopy.approvedByGroupAdmins = false,
        deckCopy.deckCopiedFrom = req.body.deckToCopy;
        const savedDeckCopy = await deckCopy.save();

        const newMessage = new DeckSubmission({
            acceptanceStatus: 'pending',
            sendingUser: req.body.sendingUser,
            targetDeck: savedDeckCopy._id,
            targetGroup: req.body.targetGroup,
            deckName: savedDeckCopy.name,
            read: []
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
    console.log("join-code route hit");
    console.log({group: req.group});
    try {
        const user = await User.findById(req.body.userId);
        console.log({user});
        if(user && req.body.joinCode === req.group.joinCode) {
            console.log("join codes match");
            const updatedGroup = await Group.findByIdAndUpdate(req.group._id, {$addToSet: {members: user._id}}, {new: true});
            await User.findByIdAndUpdate(req.body.userId, {$addToSet: {groups: updatedGroup._id}});
            //create new notification here to send to all members of the group
            res.status(200).send(updatedGroup._id);
        } else {
            res.status(404).send("Invalid join code");
        }
    } catch (err) {
        res.status(500).send("There was an error with your request");
    }
});

groupRouter.post("/:groupId/members/request", async(req, res, next) => {
    console.log("request route hit");
    try {
        if(req.group.administrators.includes(req.body.adminId)) {
            const user = await User.findById(req.body.newMember);
            await Group.findByIdAndUpdate(req.group._id, {$addToSet: {members: user._id}}, {new: true});
            await User.findByIdAndUpdate(user._id, {$addToSet: {groups: req.group._id}});
            res.status(200).send(user._id);
            // let newNotification = new JoinDecision({
            //     decision: "approved", 
            //     groupTarget: req.group._id
            // });
            // newNotification.save((err, savedNotification) => {
            //     User.findByIdAndUpdate(user._id, {$push: {notifications: savedNotification}});
            //     res.status(200).send("Member successfully added");
            // })
        } else {
            res.status(400).send("You are not authorized to add a member to this group");
        }
        
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

// groupRouter.post("/:groupId/members", (req, res, next) => {
//     User.findById(req.body.user, (err, user) => {
//         if(err) {
//             res.status(500).send("There was an error with your request");
//             throw err;
//         } else if(!user) {
//             res.status(404).send("User not found");
//         } else {
//             Group.findByIdAndUpdate(req.group._id, {$addToSet: {members: user._id}}, (err, group) => {
//                 if(err) {
//                     res.status(500).send("There was an error with your request");
//                     throw err;
//                 } else {
//                     res.status(200).send(user._id);
//                 }
//             });
//         }
//     });
// });

export default groupRouter;