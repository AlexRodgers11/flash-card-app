const express = require("express");
const groupRouter = express.Router();

const Group = require("../models/group");

groupRouter.get("/", (req, res, next) => {
    Group.find({}, (err, groups) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(groups);
        }
    });
});


module.exports = groupRouter;