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

groupRouter.get("/:groupId", (req, res, next) => {
    Group.findById(req.params.groupId, (err, group) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            if(!group) {
                res.status(404).send("Group not found");
            } else {
                res.status(200).send(group);
            }
        }
    });
});

module.exports = groupRouter;