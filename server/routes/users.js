import express from "express";
const userRouter = express.Router();

import User from "../models/user.js";
import Group from "../models/group.js";
import Deck from "../models/deck.js";
import Attempt from "../models/attempt.js";

userRouter.param("userId", (req, res, next, userId) => {
    User.findById(userId, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
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
    if(req.query.partial) {
        let partialData = {
            firstName: req.user.name.first,
            lastName: req.user.name.last,
            username: req.user.login.username,
            password: req.user.login.password, /////////////////////////delete this once testing is done
            email: req.user.email,
            photo: req.user.photo,
        }
        res.status(200).send(partialData);
    } else {
        User.findById(req.user._id)
            .populate('decks', 'name')
             .then((user) => {
                res.status(200).send(user);          
            })
            .catch(err => {
                res.status(500).send("There was an error with your request");
                throw err;
            });
    }
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
    User.findByIdAndUpdate(req.user._id, req.body, {new: true}, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(user)
        }
    });
});

userRouter.get("/:userId/decks", (req, res, next) => {
    res.status(200).send(JSON.stringify(req.user.decks));
});

userRouter.post("/:userId/decks", (req, res, next) => {
    let newDeck = new Deck({
        name: req.body.deckName,
        public: req.body.public,
        creator: req.body.creator,
        dateCreated: req.body.dateCreated
    });
    newDeck.save((err, deck) => {
        User.findByIdAndUpdate(req.user._id, {$push: {decks: deck}}, (err, user) => {
            if(err) {
                res.status(500).send("There was an error with your request");
            } else {
                res.status(200).send(newDeck._id);
            }
        });
    });
});

userRouter.post("/:userId/attempts", (req, res, next) => {
    let newAttempt = new Attempt(req.body);
    newAttempt.save((err, attempt) => {
        User.findByIdAndUpdate(req.user._id, {$push: {attempts: attempt}}, (err, user) => {
            if(err) {
                res.status(500).send("There was an error with your request");
                throw err;
            } else {
                res.status(200).send(attempt);
            }
        });
    });
});

userRouter.delete("/:userId/attempts/:attemptId", (req, res, next) => {
    User.findByIdAndUpdate(req.user._id, {$pull: {attempts: req.params.attemptId}}, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            Attempt.findByIdAndDelete(req.params.attemptId, (err, attempt) => {
                if(err) {
                    res.status(500).send("There was an error with your request");
                    throw err;
                } else {
                    res.status(200).send(attempt);
                } 
            });
        }
    });
});

userRouter.delete("/:userId/attempts", (req, res, next) => {
    Attempt.deleteMany({_id: req.user.attempts}, (err, deletedAttemptsObj) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            User.findByIdAndUpdate(req.user._id, {$set: {attempts: []}}, (err, user) => {
                if(err) {
                    res.status(500).send("There was an error with your request");
                    throw err;
                } else {
                    res.status(200).send(JSON.stringify(deletedAttemptsObj.deletedCount));
                }
            });
        }
    });
});

userRouter.delete("/:userId/decks/:deckId/attempts", (req, res, next) => {
    Attempt.find({$and: [{_id: {$in: req.user.attempts}}, {deck: req.params.deckId}]}, (err, attempts) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            let attemptIds = attempts.map(attempt => attempt._id);
            Attempt.deleteMany({_id: {$in: attemptIds}}, (err, deletedAttemptsObj) => {
                if(err) {
                    res.status(500).send("There was an error with your request");
                    throw err;
                } else {
                    User.findByIdAndUpdate(req.user._id, {$pull: {attempts: {$in: attemptIds}}}, (err, user) => {
                        if(err) {
                            res.status(500).send("There was an error with your request");
                            throw err;
                        } else {
                            res.status(200).send(JSON.stringify(deletedAttemptsObj.deletedCount));
                        }
                    });
                }
            });
        }
    });
});


export default userRouter;