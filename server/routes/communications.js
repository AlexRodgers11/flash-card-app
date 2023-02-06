import express from "express";
import { getUserIdFromJWTToken } from "../utils.js";
import User from "../models/user.js";
import { DeckDecision, DeckSubmission, Message } from "../models/message.js";
import { Notification } from '../models/notification.js';

const communicationRouter = express.Router();

communicationRouter.get("/", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        const foundUser = await User.findById(req.userId, "messages notifications -_id")
        // const foundUser = await User.findById("63db29f6827871ce88c61064", "messages notifications -_id")
            .populate("messages.received", "messageType read")
            .populate("messages.sent", "messageType read")
            .populate("notifications", "notificationType read");
        res.status(200).send({messages: foundUser.messages, notifications: foundUser.notifications});
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
});

export default communicationRouter;