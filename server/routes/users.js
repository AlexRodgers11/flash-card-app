const express = require("express");
const userRouter = express.Router();

const User = require("../models/user");
const Group = require("../models/group");

userRouter.param("userId", (req, res, next, userId) => {
    User.findById(userId, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            if(!user) {
                res.status(404).send("Group not found");
            } else {
                req.user = user;
                next();
            }
        }
    });
});

userRouter.get("/:userId", (req, res, next) => {
    res.status(200).send(req.user);
});

userRouter.get("/:userId/groups", (req, res, next) => {
    Group.find({members: req.user._id}, (err, groups) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            //should probably come back and map groups to a smaller object needed to render the page
            res.status(200).send(groups);
        }
    });
});

userRouter.put("/:userId", (req, res, next) => {
    User.findByIdAndUpdate(req.user._id, req.body, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            res.status(200).send(user)
        }
    });
});

module.exports = userRouter;