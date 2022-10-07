import express from "express";
const messageRouter = express.Router();
import { Message } from "../models/message.js";


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
        switch(message.__t) {
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
            default:
                res.status(500).send("There was an error with your request");
                break;
        }

    }); 
});

messageRouter.put('/:messageId', (req, res, next) => {
    Message.findByIdAndUpdate(req.message._id, req.body, {new: true}, (err, message) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        }
        res.status(200).send(message);
    });
});

export default messageRouter;