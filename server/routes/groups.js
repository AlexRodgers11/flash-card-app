const express = require("express");
const groupRouter = express.Router();

const Group = require("../models/group");

groupRouter.param("groupId", (req, res, next, groupId) => {
    Group.findById(req.params.groupId, (err, group) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            if(!group) {
                res.status(404).send("Group not found");
            } else {
                req.group = group;
                next();
            }
        }
    });
});

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

groupRouter.post("/", (req, res, next) => {
    if(!req.body.name) {
        return res.status(400).send("All groups must have a name");
    } else {
        let newGroup = new Group();
        newGroup.name = req.body.name;
        newGroup.save()
            .catch(err => {
                res.status(500).send("Add group failed");
                throw err
            })
            .then(res.status(200).send(newGroup));
    }
});

groupRouter.get("/:groupId", (req, res, next) => {
    res.status(200).send(req.group);
});




module.exports = groupRouter;