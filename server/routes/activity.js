import express from "express";
const activityRouter = express.Router();

import Activity from "../models/activity.js";

activityRouter.param("activityId", (req, res, next, activityId) => {
    Activity.findById(activityId, (err, activity) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            if(!activity) {
                res.status(404).send("Activity not found");
            } else {
                req.activity = activity;
                next();
            }
        }
    });
});

activityRouter.get("/:activityId", (req, res, next) => {
    Activity.findById(req.activity._id)
        .populate('actor', 'login.username name photo')
        .populate('groupTarget', 'name')
        .populate('deckTarget', 'name')
        .then((activity) => {
            res.status(200).send(activity);
        })
        .catch(err => {
            res.status(500).send("There was an error with your request");
        });
});

activityRouter.delete("/:activityId", (req, res, next) => {
    Activity.findByIdAndDelete(req.activity._id, (err, activity) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } 
        res.status(200).send("Activity deleted");
    });
});

export default activityRouter;