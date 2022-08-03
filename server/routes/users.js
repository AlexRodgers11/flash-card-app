const express = require("express");
const userRouter = express.Router();

const User = require("../models/user");

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

module.exports = userRouter;