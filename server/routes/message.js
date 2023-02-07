import express from "express";
const messageRouter = express.Router();
import { DeckDecision, DeckSubmission, DirectMessage, JoinDecision, JoinRequest, Message } from "../models/message.js";
import Deck from "../models/deck.js";
import Group from "../models/group.js";
import User from "../models/user.js";
import { DeckAddedNotification, NewMemberJoinedNotification } from "../models/notification.js";
import { getUserIdFromJWTToken } from "../utils.js";

const baseURL = 'http://localhost:8000';

messageRouter.param("messageId", (req, res, next, messageId) => {
    Message.findById(messageId, (err, message) => {
        if(err) {
            res.status(500).send("There wasn an error with your request");
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

messageRouter.get("/:messageId", async (req, res, next) => {
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
            default:
                console.error(error);
                res.status(500).send("There was an error with your request");
                break;
        }
    } catch (err) {

    }
});

messageRouter.patch('/:messageId/add-to-read', getUserIdFromJWTToken, async (req, res, next) => {
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
        console.log({userIdInMessageRouter: req.userId});
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
                if(!foundGroup.administrators.includes(req.userId)) {
                    res.status(403).send("Only group administrators may approve or deny submitted decks");
                    return;
                }
                

                //if it has already been approved/denied, send back the acceptanceStatus and (if approved) the added deck id
                if(foundDeckSubmissionMessage.acceptanceStatus !== "pending") {
                    res.status(409).send(`This deck has already been ${foundDeckSubmissionMessage.acceptanceStatus}`);
                } else {
                    //otherwise first update the acceptanceStatus of the DeckSubmission message
                    await DeckSubmission.findByIdAndUpdate(req.message._id, {acceptanceStatus: req.body.decision});

                    // get the deck name to send back for the message in case deck/id get deleted if submission denied
                    const submittedDeck = await Deck.findById(foundDeckSubmissionMessage.targetDeck, "name creator");

                    //handle add/delete deck based on approval/denial decision
                    if(req.body.decision === "approved") {
                        const updatedDeck = await Deck.findByIdAndUpdate(foundDeckSubmissionMessage.targetDeck, {approvedByGroupAdmins: true}, {new: true});
                        const updatedGroup = await Group.findByIdAndUpdate(foundDeckSubmissionMessage.targetGroup, {$push: {decks: updatedDeck._id}});
                        //possibly exclude the approver's id;
            
                        const otherGroupMembers = updatedGroup.members.filter(memberId => memberId.toString() !== req.userId && memberId !== req.message.sendingUser);
                        
                        const bulkOperations = await Promise.all(otherGroupMembers.map(async (memberId) => {
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
                        
                        await User.bulkWrite(bulkOperations);

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

                    res.status(200).send({sentMessage: {_id: savedDeckDecisionMessage._id, read: savedDeckDecisionMessage.read, messageType: savedDeckDecisionMessage.messageType}, acceptanceStatus: req.body.decision});
                }
                break;
                case 'JoinRequest':
                    console.log("in JoinRequest case");
                    const foundJoinRequestMessage = await JoinRequest.findById(req.message._id);
                    console.log({foundJoinRequestMessage});
                    
                    if(foundJoinRequestMessage.acceptanceStatus !== "pending") {
                        console.log("message already handled");
                        res.status(200).send({
                            acceptanceStatus: foundJoinRequestMessage.acceptanceStatus,
                            groupId: foundJoinRequestMessage.targetGroup._id
                        });
                    } else {
                        await JoinRequest.findByIdAndUpdate(req.message._id, {acceptanceStatus: req.body.decision});

                        if(req.body.decision === "approved") {
                            const foundGroup = await Group.findById(foundJoinRequestMessage.targetGroup, "members");
                            await Group.findByIdAndUpdate(foundJoinRequestMessage.targetGroup, {$addToSet: {members: foundJoinRequestMessage.sendingUser}});
                            await User.findByIdAndUpdate(foundJoinRequestMessage.sendingUser, {$addToSet: {groups: foundJoinRequestMessage.targetGroup}});
                            // const memberJoinedNotification = new NewMemberJoinedNotification({member: foundJoinRequestMessage.sendingUser, targetGroup: foundJoinRequestMessage.targetDeck});
                            // await memberJoinedNotification.save();
                            // await User.updateMany({_id: {$in: foundGroup.members}}, {$push: {notifications: memberJoinedNotification}});
                            const otherGroupMembers = foundGroup.members.filter(memberId => memberId.toString() !== req.body.decidingUserId);
                            await User.updateMany({_id: {$in: otherGroupMembers}}, {$push: {notifications: await NewMemberJoinedNotification.create({member: foundJoinRequestMessage.sendingUser, targetGroup: foundJoinRequestMessage.targetGroup, read: false})}});


                            // const bulkOps = foundGroup.members.map(async memberId => {
                            //     try {
                            //         const memberJoinedNotification = await NewMemberJoinedNotification.create({member: foundJoinRequestMessage.sendingUser, targetGroup: foundJoinRequestMessage.targetDeck});
                            //         return {updateOne: {
                            //           filter: { _id: memberId },
                            //           update: { $push: { notifications: memberJoinedNotification } }
                            //         }}
                            //     } catch (err) {
                            //         console.error(err);
                            //         throw err;
                            //     }
                            //   });
                            
                            // await User.bulkWrite(bulkOps);
                        }  

                        const joinDecisionMessage = new JoinDecision({
                            sendingUser: req.body.decidingUserId,
                            receivingUsers: [foundJoinRequestMessage.sendingUser],
                            acceptanceStatus: req.body.decision,
                            comment: req.body.comment,
                            targetGroup: foundJoinRequestMessage.targetGroup,
                            targetUser: foundJoinRequestMessage.sendingUser
                        });

                        const savedJoinDecisionMessage = await joinDecisionMessage.save();

                        await User.findByIdAndUpdate(foundJoinRequestMessage.sendingUser, {$push: {"messages.received": savedJoinDecisionMessage}});
                        await User.findByIdAndUpdate(req.body.decidingUserId, {$push: {"messages.sent": savedJoinDecisionMessage}});


                        res.status(200).send({sentMessage: {_id: savedJoinDecisionMessage._id, read: savedJoinDecisionMessage.read, messageType: savedJoinDecisionMessage.messageType}, acceptanceStatus: req.body.decision});
                    }
                    break;
                    
                case 'DirectMessage':
                    // await DirectMessage.findByIdAndUpdate(req.message._id, updateObj, options);
                    break;
            default:
                break;
        }    
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

messageRouter.delete("/:messageId", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        const deletingUser = await User.findById(req.userId, "_id messages");

        if(deletingUser?.messages[req.query.direction].includes(req.message._id)) {
            const updateObj = {
                ...(req.query.direction === "received" && {$pull: {receivingUsers: deletingUser._id}}),
                ...(req.query.direction === "sent" && {$set: {sendingUserDeleted: true}})
            }
            const updatedMessage = await Message.findByIdAndUpdate(req.message._id, updateObj, {new: true});
            console.log({updatedMessage});
            
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

        } else {
            res.status(403).send("Only recipients of a message may deleted it");
        }
        
    } catch (err) {
        console.error({err});
        res.status(500).send(err.message);
    }
});

export default messageRouter;