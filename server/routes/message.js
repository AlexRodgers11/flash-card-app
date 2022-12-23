import express from "express";
const messageRouter = express.Router();
import axios from "axios";
import { DeckSubmission, DirectMessage, JoinRequest, Message } from "../models/message.js";

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

messageRouter.get("/:messageId", (req, res, next) => {
    Message.findById(req.message._id, (err, message) => {
        if(err) {
            console.error(err);
            throw err;
        }
        // switch(message.__t) {
        switch(message.message) {
            case 'DeckSubmission':
                message.populate(
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
                            }
                        ]
                    )
                        .then(message => {
                            res.status(200).send(message);
                        })
                        .catch(err => {
                            console.error(err);
                            throw err;
                        })
                break;
            case 'DeckDecision':
                message.populate(
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
                        }
                    ]
                )
            case "JoinRequest":
                message.populate(
                    [
                        {
                            path: 'sendingUser',
                            select: 'login.username name.first name.last'
                        },
                        {
                            path: 'targetGroup',
                            select: 'name'
                        }
                    ]
                )
                    .then(message => {
                        res.status(200).send(message);
                    })
                    .catch(err => {
                        console.error(err);
                        throw err;
                    })
                break;
            default:
                res.status(500).send("There was an error with your request");
                break;
        }

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
    console.log({body: req.body});
    const updateObj = {acceptanceStatus: req.body.acceptanceStatus};
    
    const options = {new: true};
    
    try {
        switch(req.body.messageType) {
            case 'DeckSubmission':
                const updatedDeckSubmissionMessage = await DeckSubmission.findByIdAndUpdate(req.message._id, updateObj, options);

                const deckCopyResponse = await axios.post(`${baseURL}/groups/${updatedDeckSubmissionMessage.targetGroup}/decks?approved=true`, {idOfDeckToCopy: updatedDeckSubmissionMessage.targetDeck});


                const responseMessage = await axios.post(`${baseURL}/users/${req.message.sendingUser}/messages`, {
                    messageType: "DeckDecision",
                    acceptanceStatus: req.body.acceptanceStatus,
                    comment: req.body.comment,
                    targetDeck: req.message.targetDeck,
                    targetGroup: req.message.targetGroup,
                    sendingUser: req.body.decidingUserId
                });

                res.status(200).send({
                    newActivity: deckCopyResponse.data.newActivity,
                    newDeck: deckCopyResponse.data.newDeck,
                    responseMessage: {
                        _id: responseMessage.data._id,
                        read: [],
                        message: responseMessage.data.message
                    }
                });
                break;

            case 'DirectMessage':
                await DirectMessage.findByIdAndUpdate(req.message._id, updateObj, options);
                break;
            case 'JoinRequest':
                await JoinRequest.findByIdAndUpdate(req.message._id, updateObj, options);
                break;
            default:
                await Message.findByIdAndUpdate(req.message._id, updateObj, options);
                break;
        }    

    } catch (err) {
        res.status(500).send(err.message);
    }
});

export default messageRouter;