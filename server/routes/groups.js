import express from "express";
import Activity from "../models/activity.js";
import Deck from "../models/deck.js";
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
    if(req.query.search) {
        // console.log(req.query.search);
        const regex = new RegExp(req.query.search, 'i');
        Group.find({name: {$regex: regex}}, (err, groups) => {
            if(err) {
                res.status(500).send("There was an error with your request");
                throw err;
            } else {
                res.status(200).send(groups);
            }
        });
    } else {
        Group.find({}, (err, groups) => {
            if(err) {
                res.status(500).send("There was an error with your request");
                throw err;
            } else {
                res.status(200).send(groups);
            }
        });
    }
    
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
    let response;
    if(req.query.tile) {
        response = {
            name: req.group.name,
            memberCount: req.group.members.length,
            deckCount: req.group.decks.length
        }
    } else {
        response = req.group;
    }
    res.status(200).send(response);
});

groupRouter.get("/:groupId/decks", (req, res, next) => {
    res.status(200).send(JSON.stringify(req.group.decks));
});

groupRouter.post("/:groupId/decks", (req, res, next) => {
    let newDeck = new Deck()
    newDeck.name = req.body.name;
    newDeck.publiclyAvailable = req.body.publiclyAvailable || false;
    newDeck.creator = req.body.creatorId;
    newDeck.dateCreated = Date.now();
    newDeck.save((err, deck) => {
        if(err) {
            console.error(err);
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            let newActivity = new Activity();
            newActivity.date = Date.now();
            newActivity.actor = req.body.creatorId;
            newActivity.type = "add-deck";
            newActivity.groupTarget = req.group._id;
            newActivity.deckTarget = deck._id
            newActivity.save((err, activity) => {
                if(err) {
                    res.status(500).send("There was an error with your request");
                    throw err;
                } else {
                    Group.findByIdAndUpdate(req.group._id, {$push: {decks: deck._id, activity: activity._id}})
                    .then(res.status(200).send(deck))
                    .catch(err => {
                        console.error(err);
                        res.status(500).send("There was an error with your request");
                    })
                }
            });
        }
    }); 
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