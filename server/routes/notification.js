import express from "express";
const notificationRouter = express.Router();
        import { DeckDecision, JoinDecision, Notification }  from "../models/notification.js";

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

notificationRouter.get("/:notificationId", (req, res, next) => {
    try {
        //why didn't instantiating response here work- setting it inside the Notification callback didn't work, remains "test" outside the callback
        // let response = "test";
        Notification.findById(req.notification._id, async (err, notification) => {
            if(err) {
                res.status(500).send(err.message);
                throw err;
            }
            switch(notification.notificationType) {
                case 'DeckDecision':
                    let foundDeckDecisionNotification = await DeckDecision.findById(notification._id);
                    let populatedDeckDecisionNotification = await foundDeckDecisionNotification.populate(
                        [
                                    {
                                        path: 'actor',
                                        select: 'login.username name.first name.last'
                                    },
                                    {
                                        path: 'groupTarget',
                                        select: 'name'
                                    },
                                    {
                                        path: 'deckTarget',
                                        select: 'name'
                                    }
                                ]
                    );
                    response = populatedDeckDecisionNotification;
                    break;
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

export default notificationRouter;