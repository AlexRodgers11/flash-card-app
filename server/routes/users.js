const express = require("express");
const userRouter = express.Router();

const User = require("../models/user");
const Group = require("../models/group");
const Deck = require("../models/deck");
const Attempt = require("../models/attempt");

userRouter.param("userId", (req, res, next, userId) => {
    User.findById(userId, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            if(!user) {
                res.status(404).send("User not found");
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

userRouter.post("/", (req, res, next) => {
    let newUser = new User(req.body);
    newUser.save((err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(user)
        }
    });
});

userRouter.delete("/:userId", (req, res, next) => {
    User.findByIdAndDelete(req.user._id, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            Group.updateMany({members: user._id}, {$pull: {members: user._id}})
                .catch((err) => {
                    res.status(500).send("There was an error with your request");
                    throw err;
                })
                // .then((err, matchedCount, modifiedCount, upsertedId) => {
                //     //all arguments passed to .then() are undefined
                //     console.log(`Matched count: ${matchedCount}`);
                //     console.log(`Modified count: ${modifiedCount}`);
                //     console.log(`Upserted id: ${upsertedId}`);
                // });
                .then(() => {
                    console.log("done removing user from groups");
                    Deck.deleteMany({creator: user._id})
                        .catch(err => {
                            if(err) {
                                res.status(500).send("There was an error with your request");
                                throw err;
                            }
                        })
                        .then(() => {
                            console.log("done removing decks created by user");
                            Deck.updateMany({"permissions.view": user._id}, {$pull: {"permissions.view": user._id}})
                                .catch(err => {
                                    if(err) {
                                        res.status(500).send("There was an error with your request");
                                        throw err;
                                    }
                                })
                                .then(() => {
                                    console.log("Done removing user from edit permissions");
                                    Deck.updateMany({"permissions.edit": user._id}, {$pull: {"permissions.edit": user._id}})
                                        .catch(err => {
                                            if(err) {
                                                res.status(500).send("There was an error with your request");
                                                throw err;
                                            }
                                        })
                                        .then(() => {
                                            console.log("Done removing user from edit permissions");
                                            Attempt.deleteMany({_id: {$in: user.attempts}})
                                                .catch(err => {
                                                    if(err) {
                                                        res.status(500).send("There was an error with your request");
                                                    }
                                                })
                                                .then(() => {
                                                    console.log("Done removing user's attempts");
                                                    res.status(200).send(user);
                                                });
                                        })
                                })
                        })
                })    
        }
    });
});

userRouter.put("/:userId", (req, res, next) => {
    User.findByIdAndUpdate(req.user._id, req.body, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(user)
        }
    });
});

module.exports = userRouter;