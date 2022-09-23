import express from "express";
const notificationRouter = express.Router();
import Notification from "../models/notification.js";

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
    Notification.findById(req.notification._id, (err, notification) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        }
        switch(notification.type) {
            case 'deck-approved':
                notification.populate(
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
                )
                .then(notification => {
                    res.status(200).send(notification);
                })
                .catch(deckApprovalPopulationError => {
                    res.status(500).send("There was an error with your request");
                    throw deckApprovalPopulationError;
                });
                break; 
            default:
                res.status(500).send("There was an error with your request");
                break;
        }
    });
});

export default notificationRouter;