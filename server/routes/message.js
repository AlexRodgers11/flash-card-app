import express from "express";
const messageRouter = express.Router();
import axios from "axios";
import { DeckDecision, DeckSubmission, DirectMessage, JoinDecision, JoinRequest, Message } from "../models/message.js";
import Deck from "../models/deck.js";
import Group from "../models/group.js";
import User from "../models/user.js";
import { DeckAddedNotification, NewMemberJoinedNotification } from "../models/notification.js";

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
                populatedMessage = await DeckSubmission.findById(req.message._id).populate(
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
                console.log({populatedMessage});
                res.status(200).send(populatedMessage);
                break;
            case 'DeckDecision':
                populatedMessage = await DeckDecision.findById(req.message._id).populate(
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
                console.log(populatedMessage);
                res.status(200).send(populatedMessage);
                break;
            case "JoinRequest":
                console.log("In JoinRequest case");
                populatedMessage = await JoinRequest.findById(req.message._id).populate(
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
                console.log({populatedMessage});
                res.status(200).send(populatedMessage);
                break;
            case "JoinDecision":
                console.log("In join decision case");
                populatedMessage = await JoinDecision.findById(req.message._id).populate(
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
    
    Message.findById(req.message._id, async (err, message) => {
        if(err) {
            console.error(err);
            throw err;
        }
        // switch(message.__t) {
        

    }); 
});

messageRouter.patch('/:messageId/add-to-read', async (req, res, next) => {
    try {
        const updatedMessage = await Message.findByIdAndUpdate(req.message._id, {$addToSet: {read: req.body.readerId}}, {new: true});
        res.status(200).send({messageId: updatedMessage._id, read: updatedMessage.read});
    } catch (err) {
        res.status(500).send(err.message);
    }
});

messageRouter.patch('/:messageId', async (req, res, next) => {
    try {
        switch(req.body.messageType) {
            case "DeckSubmission": //should this be DeckSubmission
                //first make sure hasn't already been approved/denied by another admin
                const foundDeckSubmissionMessage = await DeckSubmission.findById(req.message._id).populate("targetDeck", "name");

                //if it has, send back the acceptanceStatus and (if approved) the added deck id
                if(foundDeckSubmissionMessage.acceptanceStatus !== "pending") {
                    res.status(200).send({
                        acceptanceStatus: foundDeckSubmissionMessage.acceptanceStatus,
                        deckName: foundDeckSubmissionMessage.targetDeck.name,
                        //only send back the _id if approved because otherwise the deck would have been deleted and the id would no longer exist
                        ...(foundDeckSubmissionMessage.acceptanceStatus === "approved" && {deckId: foundDeckSubmissionMessage.targetDeck._id})
                    });
                } else {
                    //otherwise first update the acceptanceStatus of the DeckSubmission message
                    await DeckSubmission.findByIdAndUpdate(req.message._id, {acceptanceStatus: req.body.decision});

                    // get the deck name to send back for the message in case deck/id get deleted if submission denied
                    const submittedDeck = await Deck.findById(req.body.deckId, "name creator");

                    //handle add/delete deck based on approval/denial decision
                    if(req.body.decision === "approved") {
                        const updatedDeck = await Deck.findByIdAndUpdate(req.body.deckId, {approvedByGroupAdmins: true}, {new: true});
                        const updatedGroup = await Group.findByIdAndUpdate(req.body.groupId, {$push: {decks: updatedDeck._id}});
                        //possibly exclude the approver's id
                        const otherGroupMembers = updatedGroup.members.filter(memberId => memberId.toString() !== req.body.decidingUserId && memberId.toString() !== req.message.sendingUser.toString());
                        await User.updateMany({_id: {$in: otherGroupMembers}}, {$push: {notifications: await DeckAddedNotification.create({targetDeck: updatedDeck, targetGroup: foundDeckSubmissionMessage.targetGroup, read: false})}});
                    } else if(req.body.decision === "denied") {
                        await Deck.findByIdAndDelete(req.body.deckId)
                    }

                    const deckDecisionMessage = new DeckDecision({
                        sendingUser: req.body.decidingUserId,
                        read: [],
                        acceptanceStatus: req.body.decision,
                        comment: req.body.comment,
                        deckName: submittedDeck.name,
                        targetDeck: req.body.deckId,
                        targetGroup: req.body.groupId,
                        targetUser: submittedDeck.creator
                    });

                    const savedDeckDecisionMessage = await deckDecisionMessage.save();
                    await User.findByIdAndUpdate(foundDeckSubmissionMessage.sendingUser, {$push: {"messages.received": savedDeckDecisionMessage}});
                    await User.findByIdAndUpdate(req.body.decidingUserId, {$push: {"messages.sent": savedDeckDecisionMessage}});

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
                            read: [],
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

export default messageRouter;