import express from "express";
const groupRouter = express.Router();

import Group from "../models/group.js";
import User from "../models/user.js";

groupRouter.param("groupId", (req, res, next, groupId) => {
    Group.findById(groupId, (err, group) => {
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

groupRouter.get("/:groupId/decks", (req, res, next) => {
    res.status(200).send(JSON.stringify(req.group.decks));
});

groupRouter.delete("/:groupId", (req, res, next) => {
    Group.findByIdAndDelete(req.group._id, (err, group) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err
        }
        else {
            res.status(200).send(group);
        }
    });
});

groupRouter.put("/:groupId", (req, res, next) => {
    Group.findByIdAndUpdate(req.group._id, req.body, (err, group) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(group);
        }
    });
});

groupRouter.post("/:groupId", (req, res, next) => {
    User.findById(req.body._id, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            if(!user) {
                res.status(404).send("User not found");
            } else {
                Group.findByIdAndUpdate(req.group._id, {$addToSet: {members: user._id}}, (err, group) => {
                    if(err) {
                        res.status(500).send("There was an error with your request");
                        throw err;
                    } else {
                        res.status(200).send(user);
                    }
                });
            }
        }
    });
});

export default groupRouter;