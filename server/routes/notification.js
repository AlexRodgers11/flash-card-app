import express from "express";
const notificationRouter = express.Router();

import { getUserIdFromJWTToken } from "../utils.js";
import { AdminChangeNotification, DeckAddedNotification, GroupDeletedNotification, HeadAdminChangeNotification, NewMemberJoinedNotification, Notification, RemovedFromGroupNotification }  from "../models/notification.js";
import User from "../models/user.js";


notificationRouter.param("notificationId", (req, res, next, notificationId) => {
    Notification.findById(notificationId, (err, notification) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            console.error(err);
        }
        if(!notification) {
            res.status(404).send("Notification not found");
            console.error(err);
        } else {
            req.notification = notification;
            next();
        }
    });
});

notificationRouter.patch("/mark-as-read", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        const foundUser = await User.findById(req.userId, "notifications");

        await Notification.updateMany({_id: {$in: foundUser.notifications}}, {$set: {read: true}});
        let user = await User.findById(req.userId, "notifications")
            .populate({
                path: "notifications",
                select: "read notificationType"
            })
        res.status(200).send(user.notifications);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

notificationRouter.get("/:notificationId", async (req, res, next) => {
    let notificationResponse;
    try {
        switch(req.query.type) {
            case "NewMemberJoined": 
                notificationResponse = await NewMemberJoinedNotification.findById(req.notification._id).populate(
                    [
                        {
                            path: "member",
                            select: "login.username name.first name.last"
                        },
                        {
                            path: "targetGroup",
                            select: "name"
                        }
                    ]
                );
                res.status(200).send(notificationResponse);
                break;
            case "DeckAdded":
                notificationResponse = await DeckAddedNotification.findById(req.notification._id).populate(
                    [
                        {
                            path: "targetDeck",
                            select: "name"
                        },
                        {
                            path: "targetGroup",
                            select: "name"
                        }
                    ]
                );
                res.status(200).send(notificationResponse);
                break;
            case "AdminChange":
                notificationResponse = await AdminChangeNotification.findById(req.notification._id).populate(
                    [
                        {
                            path: "targetGroup",
                            select: "name"
                        },
                        {
                            path: "decidingUser",
                            select: "login.username name.first name.last"
                        }
                    ]
                );
                res.status(200).send(notificationResponse);
                break;
            case "RemovedFromGroup":
                notificationResponse = await RemovedFromGroupNotification.findById(req.notification._id).populate(
                    [
                        {
                            path: "targetGroup",
                            select: "name"
                        },
                        {
                            path: "decidingUser",
                            select: "login.username name.first name.last"
                        }
                    ]
                );
                res.status(200).send(notificationResponse);
                break;
            case "GroupDeleted":
                notificationResponse = await GroupDeletedNotification.findById(req.notification._id);
                res.status(200).send(notificationResponse);
                break;
            case "HeadAdminChange":
                notificationResponse = await HeadAdminChangeNotification.findById(req.notification._id).populate(
                    [
                        {
                            path: "previousHeadAdmin",
                            select: "login.username name.first name.last"
                        },
                        {
                            path: "newHeadAdmin",
                            select: "login.username name.first name.last"
                        },
                        {
                            path: "targetGroup",
                            select: "name"
                        }
                    ]
                );
                res.status(200).send(notificationResponse);
                break;
            default: 
                res.status(500).send("Invalid notification type requested");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

notificationRouter.get("/:notificationId", (req, res, next) => {
    try {
        Notification.findById(req.notification._id, async (err, notification) => {
            let response;
            if(err) {
                res.status(500).send(err.message);
                throw err;
            }
            switch(notification.notificationType) {
                case 'JoinDecision':
                    let foundJoinDecisionNotification = await JoinDecision.findById(notification._id);
                    let populatedJoinDecisionNotification = await foundJoinDecisionNotification.populate(
                        [
                            {
                                path: 'actor',
                                select: 'login.username name.first name.last'
                            },
                            {
                                path: 'groupTarget',
                                select: 'name'
                            }
                        ]
                    );
                    response = populatedJoinDecisionNotification;
                    break;
                default:
                    res.status(400).send("You are attempting to retrieve an invalid type of notification");
                    break;
            }
            res.status(200).send(response);
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

notificationRouter.delete("/:notificationId", async (req, res, next) => {
    try {
        await Notification.findByIdAndDelete(req.notification._id);
        res.status(200).send("Successfully deleted");
    } catch (err) {
        console.error({err});
        res.status(500).send(err.message);
    }
});

export default notificationRouter;