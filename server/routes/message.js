import express from "express";
const messageRouter = express.Router();
import { DeckDecision, DeckSubmission, DirectMessage, GroupInvitation, InvitationDecision, JoinDecision, JoinRequest, Message } from "../models/message.js";
import Deck from "../models/deck.js";
import Group from "../models/group.js";
import User from "../models/user.js";
import { DeckAddedNotification, NewMemberJoinedNotification } from "../models/notification.js";
import { getUserIdFromJWTToken, sendEmail } from "../utils.js";

const checkMessageOwnership = (req, res, next) => {
    if(req.message.sendingUser.toString() !== req.userId && !req.message.receivingUsers.some(id => id.toString() === req.userId)) {
        return res.status(401).send("Unauthorized");
    }
    next();
}

messageRouter.param("messageId", (req, res, next, messageId) => {
    Message.findById(messageId, (err, message) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            if(!message) {
                res.status(404).send("Message not found");
            } else {
                req.message = message;
                next();
            }
        }
    })
});

messageRouter.get("/:messageId", getUserIdFromJWTToken, checkMessageOwnership, async (req, res, next) => {
    try {
        let populatedMessage;
        switch(req.query.type) {
            case 'DeckSubmission':
                populatedMessage = await DeckSubmission.findById(req.message._id, "-sendingUserDeleted").populate(
                        [
                            {
                                path: 'sendingUser',
                                select: 'login.username name.first name.last'
                            },
                            {
                                path: 'targetDeck',
                                select: 'name'
                            },
                            {
                                path: 'targetGroup',
                                select: 'name'
                            },
                        ]
                    )
                res.status(200).send(populatedMessage);
                break;
            case 'DeckDecision':
                populatedMessage = await DeckDecision.findById(req.message._id, "-sendingUserDeleted").populate(
                    [
                        {
                            path: 'sendingUser',
                            select: 'login.username name.first name.last'
                        },
                        {
                            path: 'targetGroup',
                            select: 'name'
                        },
                        {
                            path: "targetUser",
                            select: "login.username name.first name.last"
                        }
                    ]
                );
                res.status(200).send(populatedMessage);
                break;
            case "GroupInvitation":
                populatedMessage = await GroupInvitation.findById(req.message._id, "-sendingUserDeleted").populate([
                    {
                        path: "sendingUser",
                        select: "login.username name.first name.last"
                    },
                    {
                        path: "targetGroup",
                        select: "name"
                    },
                    {
                        path: "targetUser",
                        select: "login.username name.first name.last"
                    }
                ]);
                res.status(200).send(populatedMessage);
                break;
            case "InvitationDecision":
                populatedMessage = await InvitationDecision.findById(req.message._id, "-sendingUserDeleted").populate([
                    {
                        path: "sendingUser",
                        select: "login.username name.first name.last"
                    },
                    {
                        path: "targetGroup",
                        select: "name"
                    }
                ]);
                res.status(200).send(populatedMessage);
                break;
            case "JoinRequest":
                populatedMessage = await JoinRequest.findById(req.message._id, "-sendingUserDeleted").populate(
                    [
                        {
                            path: "sendingUser",
                            select: "login.username name.first name.last"
                        },
                        {
                            path: "targetGroup",
                            select: "name"
                        }
                    ]
                );
                res.status(200).send(populatedMessage);
                break;
            case "JoinDecision":
                populatedMessage = await JoinDecision.findById(req.message._id, "-sendingUserDeleted").populate(
                    [
                        {
                            path: "sendingUser",
                            select: "login.username name.first name.last"
                        },
                        {
                            path: "targetGroup",
                            select: "name"
                        },
                        {
                            path: "targetUser",
                            select: "login.username name.first name.last"
                        }
                    ]
                );
                res.status(200).send(populatedMessage);
                break;
            case "DirectMessage":
                const message = await DirectMessage.findById(req.message._id, "-sendingUserDeleted");
                populatedMessage = await DirectMessage.findById(req.message._id, "-sendingUserDeleted").populate(
                    [
                        {
                            path: "sendingUser",
                            select: "login.username name.first name.last"
                        },
                        {
                            path: "receivingUsers",
                            select: "login.username name.first name.last"
                        }
                    ]
                );
                res.status(200).send(populatedMessage);
                break;
            default:
                res.status(500).send("Invalid message type requested");
                break;
        }
    } catch (err) {
        res.status(500).send(err.message);
        console.error(err);
    }
});

messageRouter.patch('/:messageId/add-to-read', getUserIdFromJWTToken, checkMessageOwnership, async (req, res, next) => {
    try {
        const foundMessage = await Message.findById(req.message._id, "receivingUsers");
        if(foundMessage.receivingUsers.includes(req.userId)) {
            const updatedMessage = await Message.findByIdAndUpdate(req.message._id, {$addToSet: {read: req.body.readerId}}, {new: true});
            res.status(200).send({messageId: updatedMessage._id, read: updatedMessage.read});
        } else {
            res.status(403).send("Only recipients of a message may mark it as read");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

messageRouter.patch('/:messageId',  getUserIdFromJWTToken, async (req, res, next) => {
    try {
        const foundUser = await User.findById(req.userId);//only get the fields needed by the cases

        if(!foundUser.messages.received.includes(req.message._id)) {
            res.status(403).send("Unauthorized");
            return;
        }
        switch(req.body.messageType) {
            case "DeckSubmission":
                //first make sure hasn't already been approved/denied by another admin
                const foundDeckSubmissionMessage = await DeckSubmission.findById(req.message._id).populate("targetDeck", "name");
                
                // then make sure the deciding user is an admin of the group (may have initially been when message sent but then removed)
                const foundGroup = await Group.findById(foundDeckSubmissionMessage.targetGroup, "administrators");
                if(!foundGroup.administrators.includes(foundUser._id)) {
                    res.status(403).send("Only group administrators may approve or deny submitted decks");
                    return;
                }
                

                //if it has already been approved/denied, send back the acceptanceStatus and (if approved) the added deck id
                if(foundDeckSubmissionMessage.acceptanceStatus !== "pending") {
                    res.status(409).send(`This deck has already been ${foundDeckSubmissionMessage.acceptanceStatus}`);
                    return;
                } 
                //otherwise first update the acceptanceStatus of the DeckSubmission message
                await DeckSubmission.findByIdAndUpdate(req.message._id, {acceptanceStatus: req.body.decision});

                // get the deck name to send back for the message in case deck/id get deleted if submission denied
                const submittedDeck = await Deck.findById(foundDeckSubmissionMessage.targetDeck, "name creator");

                //handle add/delete deck based on approval/denial decision
                if(req.body.decision === "approved") {
                    const updatedDeck = await Deck.findByIdAndUpdate(foundDeckSubmissionMessage.targetDeck, {approvedByGroupAdmins: true}, {new: true});
                    const updatedGroup = await Group.findByIdAndUpdate(foundDeckSubmissionMessage.targetGroup, {$push: {decks: updatedDeck._id}})
                        .populate({
                            path: "members",
                            select: "_id communicationSettings.notificationPreferences.deckAdded"
                        });
        
                    const otherGroupMembers = updatedGroup.members.filter((member) => ((member._id !== foundUser._id && member._id !== req.message.sendingUser) && member.communicationSettings.notificationPreferences.deckAdded));
                    
                    const deckAddBulkOperations = await Promise.all(otherGroupMembers.map(async (memberId) => {
                        const notification = await DeckAddedNotification.create({
                            targetDeck: updatedDeck, 
                            targetGroup: foundDeckSubmissionMessage.targetGroup, 
                            read: false
                        });

                        return {
                            updateOne: {
                                filter: {_id: memberId},
                                update: {$push: {notifications: notification}}
                            }
                        };
                    }));
                    
                    await User.bulkWrite(deckAddBulkOperations);

                } else if(req.body.decision === "denied") {
                    await Deck.findByIdAndDelete(foundDeckSubmissionMessage.targetDeck)
                }

                const deckDecisionMessage = new DeckDecision({
                    sendingUser: req.userId,
                    receivingUsers: [submittedDeck.creator. _id],
                    acceptanceStatus: req.body.decision,
                    comment: req.body.comment,
                    deckName: submittedDeck.name,
                    targetDeck: foundDeckSubmissionMessage.targetDeck,
                    targetGroup: foundDeckSubmissionMessage.targetGroup,
                    targetUser: submittedDeck.creator
                });

                const savedDeckDecisionMessage = await deckDecisionMessage.save();
                await User.findByIdAndUpdate(foundDeckSubmissionMessage.sendingUser, {$push: {"messages.received": savedDeckDecisionMessage}});
                await User.findByIdAndUpdate(req.userId, {$push: {"messages.sent": savedDeckDecisionMessage}});

                if(foundUser.communicationSettings.emailPreferences.deckDecision) {
                    const populatedMessage = await savedDeckDecisionMessage.populate([
                        {
                            path: "sendingUser",
                            select: "name.first name.last user.login.username"
                        },
                        {
                            path: "targetDeck",
                            select: "name"
                        },
                        {
                            path: "targetGroup",
                            select: "name"
                        },
                        {
                            path: "targetUser",
                            select: "login.email"
                        }
                    ]);
                    await sendEmail(populatedMessage.targetUser.login.email, populatedMessage);
                }

                res.status(200).send({sentMessage: {_id: savedDeckDecisionMessage._id, read: savedDeckDecisionMessage.read, messageType: savedDeckDecisionMessage.messageType}, acceptanceStatus: req.body.decision});
                
                break;
            case "GroupInvitation":
                const foundGroupInvitationMessage = await GroupInvitation.findById(req.message._id);

                if(req.userId.toString() === foundGroupInvitationMessage.targetUser.toString()) {
                    await GroupInvitation.findByIdAndUpdate(req.message._id, {acceptanceStatus: req.body.decision});

                    const invitationDecisionMessage = new InvitationDecision({
                        acceptanceStatus: req.body.decision,
                        targetGroup: foundGroupInvitationMessage.targetGroup,
                        sendingUser: req.userId
                    });

                    const savedInvitationDecisionMessage = await invitationDecisionMessage.save();

                    let group;
                    if(req.body.decision === "approved") {
                        group = await Group.findByIdAndUpdate(foundGroupInvitationMessage.targetGroup, {$push: {members: req.userId}}, {select: "administrators"});
                        await User.findByIdAndUpdate(req.userId, {$push: {groups: group._id}})
                    } else {
                        group = await Group.findById(foundGroupInvitationMessage.targetGroup, "administrators");
                    }

                    await User.updateMany({_id: {$in: group.administrators}}, {$push: {"messages.received": savedInvitationDecisionMessage}});
                    await User.findByIdAndUpdate(req.userId, {$push: {"messages.sent": savedInvitationDecisionMessage}});

                    const populatedMessage = await savedInvitationDecisionMessage.populate([
                        {
                            path: "sendingUser",
                            select: "name.first name.last login.username"
                        },
                        {
                            path: "targetGroup",
                            select: "name"
                        }
                    ]);
                    
                    const admins = await User.find({_id: {$in: group.administrators}, "communicationSettings.emailPreferences.invitationDecision": true}, "login.email");

                    const emailingPromises = admins.map((admin) => {
                        return sendEmail(admin.login.email, populatedMessage);
                    });

                    await Promise.all(emailingPromises);
                
                    res.status(200).send({sentMessage: {_id: savedInvitationDecisionMessage._id, read: savedInvitationDecisionMessage.read, messageType: savedInvitationDecisionMessage.messageType}, acceptanceStatus: req.body.decision});
                } else {
                    res.status(401).send("You do not have the authority to accept or reject this invitation");
                }
                break;
            case 'JoinRequest':
                const foundJoinRequestMessage = await JoinRequest.findById(req.message._id);

                // then make sure the deciding user is an admin of the group (may have initially been when message sent but then removed)
                const foundGroupToJoin = await Group.findById(foundJoinRequestMessage.targetGroup, "administrators");
                if(!foundGroupToJoin.administrators.includes(foundUser._id)) {
                    res.status(403).send("Only group administrators may approve or deny join requests");
                    return;
                }
                
                
                if(foundJoinRequestMessage.acceptanceStatus !== "pending") {
                    res.status(409).send(`This user's request has already been ${foundJoinRequestMessage.acceptanceStatus}`);
                    return;
                } 
                await JoinRequest.findByIdAndUpdate(req.message._id, {acceptanceStatus: req.body.decision});

                if(req.body.decision === "approved") {
                    const foundGroup = await Group.findById(foundJoinRequestMessage.targetGroup)
                        .populate({
                            path: "members",
                            select: "_id communicationSettings.notificationPreferences.newMemberJoined"
                        });
                    await Group.findByIdAndUpdate(foundJoinRequestMessage.targetGroup, {$addToSet: {members: foundJoinRequestMessage.sendingUser}});
                    await User.findByIdAndUpdate(foundJoinRequestMessage.sendingUser, {$addToSet: {groups: foundJoinRequestMessage.targetGroup}});
    
                    const otherGroupMembers = foundGroup.members.filter(member => member._id !== foundUser._id && member.communicationSettings.notificationPreferences.newMemberJoined);

                    const joinRequestBulkOperations = await Promise.all(otherGroupMembers.map(async (memberId) => {
                        const notification = await NewMemberJoinedNotification.create({
                            member: foundJoinRequestMessage.sendingUser, 
                            targetGroup: foundJoinRequestMessage.targetGroup, 
                            read: false
                        });

                        return {
                            updateOne: {
                                filter: {_id: memberId},
                                update: {$push: {notifications: notification}}
                            }
                        };
                    }));
                    
                    await User.bulkWrite(joinRequestBulkOperations);
                }  

                const joinDecisionMessage = new JoinDecision({
                    sendingUser: foundUser._id,
                    receivingUsers: [foundJoinRequestMessage.sendingUser],
                    acceptanceStatus: req.body.decision,
                    comment: req.body.comment,
                    targetGroup: foundJoinRequestMessage.targetGroup,
                    targetUser: foundJoinRequestMessage.sendingUser
                });

                const savedJoinDecisionMessage = await joinDecisionMessage.save();

                await User.findByIdAndUpdate(foundJoinRequestMessage.sendingUser, {$push: {"messages.received": savedJoinDecisionMessage}});
                await User.findByIdAndUpdate(foundUser._id, {$push: {"messages.sent": savedJoinDecisionMessage}});

                if(foundUser.communicationSettings.emailPreferences.joinDecision) {
                    const populatedMessage = await savedJoinDecisionMessage.populate([
                        {
                            path: "sendingUser",
                            select: "name.first name.last user.login.username"
                        },
                        {
                            path: "targetGroup",
                            select: "name"
                        },
                        {
                            path: "targetUser",
                            select: "login.email"
                        }
                    ]);
                    await sendEmail(populatedMessage.targetUser.login.email, populatedMessage);
                }

                res.status(200).send({sentMessage: {_id: savedJoinDecisionMessage._id, read: savedJoinDecisionMessage.read, messageType: savedJoinDecisionMessage.messageType}, acceptanceStatus: req.body.decision});
                
                break;
            default:
                break;
        }    
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

messageRouter.delete("/:messageId", getUserIdFromJWTToken, checkMessageOwnership, async (req, res, next) => {
    try {
        const deletingUser = await User.findById(req.userId, "_id messages");

        const updateObj = {
            ...(req.query.direction === "received" && {$pull: {receivingUsers: deletingUser._id}}),
            ...(req.query.direction === "sent" && {$set: {sendingUserDeleted: true}})
        }
        const updatedMessage = await Message.findByIdAndUpdate(req.message._id, updateObj, {new: true});
        
        let updatedUser;
        if(req.query.direction === "received") {
            updatedUser = await User.findByIdAndUpdate(deletingUser._id, {$pull: {"messages.received": req.message._id}}, {new: true});    
        } else if(req.query.direction === "sent") {
            updatedUser = await User.findByIdAndUpdate(deletingUser._id, {$pull: {"messages.sent": req.message._id}}, {new: true});
        } else {
            throw new Error("invalid direction submitted");
        }
    

        //if sending user and all receivingUsers have deleted the message from their inbox, delete from database
        if(!updatedMessage.receivingUsers.length && updatedMessage.sendingUserDeleted) {
            await Message.findByIdAndDelete(req.message._id);
            res.status(200).send("Successfully deleted");
        } else {
            res.status(200).send("message removed from user's messages");
        }
        
    } catch (err) {
        console.error({err});
        res.status(500).send(err.message);
    }
});

export default messageRouter;