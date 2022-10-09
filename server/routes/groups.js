import express from "express";
const groupRouter = express.Router();

import Activity from "../models/activity.js";
import Card from "../models/card.js";
import Deck from "../models/deck.js";
import Group from "../models/group.js";
import { DeckSubmission } from "../models/message.js";
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
    } else if(req.query.requestingUser) {
        if(!req.group.administrators.includes(req.query.requestingUser)) {
            req.group.joinCode = '';
        }
        response = req.group;
    }
    res.status(200).send(response);
});

groupRouter.get("/:groupId/decks", (req, res, next) => {
    res.status(200).send(JSON.stringify(req.group.decks));
});

groupRouter.post("/:groupId/decks", (req, res, next) => {
    if(req.query.accepted) {
        Deck.findById(req.body.idOfDeckToCopy)
            .then(foundDeck => {
                let deckCopy = new Deck();
                deckCopy.name = foundDeck.name;
                deckCopy.publiclyAvailable = foundDeck.publiclyAvailable || false;
                deckCopy.creator = foundDeck.creator;
                deckCopy.cards = foundDeck.cards;
                deckCopy.permissions = foundDeck.permissions;
                let cardsCopy = [];
                for(let i = 0; i < foundDeck.cards.length; i++) {
                    cardsCopy.push(new Promise((resolve, reject) => {
                        Card.findById(foundDeck.cards[i], (cardFindErr, foundCard) => {
                            if(cardFindErr) {
                                res.status(500).send("There was an error with your request");
                                throw err;
                            }
                            let newCard = new Card();
                            newCard.creator = foundCard.creator;
                            newCard.type = foundCard.type;
                            newCard.question = foundCard.question;
                            newCard.correctAnswer = foundCard.correctAnswer;
                            newCard.wrongAnswerOne = foundCard.wrongAnswerOne;
                            newCard.wrongAnswerTwo = foundCard.wrongAnswerTwo;
                            newCard.wrongAnswerThree = foundCard.wrongAnswerThree;
                            newCard.hint = foundCard.hint;
                            newCard.stats = {
                                numberCorrect: 0,
                                numberIncorrect: 0
                            }
                            newCard.save((cardSaveErr, card) => {
                                console.log("card copy saved");
                                if(cardSaveErr) {
                                    res.status(500).send("There was an error with your request");
                                    throw cardSaveErr;
                                }
                                resolve(card);
                            });
                        });
                    }));
                }
                Promise.all(cardsCopy).then(cards => {
                    console.log("all cards coppied over");
                    deckCopy.cards = cards;
                    deckCopy.save((err, deck) => {
                        if(err) {
                            res.status(500).send("There was an error with your request");
                            throw err;
                        } else {
                            let newActivity = new Activity();
                            // newActivity.actor = req.body.actor;
                            newActivity.actor = deck.creator;
                            newActivity.type = "add-deck";
                            newActivity.groupTarget = req.group._id;
                            newActivity.deckTarget = deck._id
                            newActivity.save((err, activity) => {
                                if(err) {
                                    res.status(500).send("There was an error with your request");
                                    throw err;
                                } else {
                                    console.log({activity});
                                    console.log({deck});
                                        Group.findByIdAndUpdate(req.group._id, {$push: {decks: deck._id, activity: activity._id}})
                                    .then(() => {
                                        res.status(200).send({
                                            newDeck: deck._id,
                                            newActivity: activity._id
                                        });
                                    })
                                    .catch(err => {
                                        console.error(err);
                                        res.status(500).send("There was an error with your request");
                                    })
                                }
                            });
                        }
                    }); 
                })
                .catch(copyCardsPromiseErr => {
                    res.status(500).send("There was an error with your request");
                    throw copyCardsPromiseErr;
                });
            })
            .catch(error => {
                console.error(error);
                throw error;
            })
    } else {
        let newDeck = new Deck()
        newDeck.name = req.body.name;
        newDeck.publiclyAvailable = req.body.publiclyAvailable || false;
        newDeck.creator = req.body.creator;
        newDeck.cards = req.body.cards;
        newDeck.permissions = req.body.permissions;
        newDeck.save((err, deck) => {
            if(err) {
                console.error(err);
                res.status(500).send("There was an error with your request");
                throw err;
            } else {
                let newActivity = new Activity();
                newActivity.actor = req.body.creator;
                newActivity.type = "add-deck";
                newActivity.groupTarget = req.group._id;
                newActivity.deckTarget = deck._id
                newActivity.save((err, activity) => {
                    if(err) {
                        res.status(500).send("There was an error with your request");
                        throw err;
                    } else {
                        console.log({activity});
                        console.log({deck});
                            Group.findByIdAndUpdate(req.group._id, {$push: {decks: deck._id, activity: activity._id}})
                        .then(() => {
                            res.status(200).send({
                                newDeck: deck._id,
                                newActivity: activity._id
                            });
                        })
                        .catch(err => {
                            console.error(err);
                            res.status(500).send("There was an error with your request");
                        })
                    }
                });
            }
        }); 
    }
    
});

groupRouter.post("/:groupId/messages/admin", (req, res, next) => {
    let newMessage = new DeckSubmission();
    newMessage.acceptanceStatus = 'pending';
    newMessage.sendingUser = req.body.sendingUser;
    newMessage.targetDeck = req.body.targetDeck;
    newMessage.targetGroup = req.body.targetGroup;
    newMessage.save((newMessageSaveError, message) => {
        if(newMessageSaveError) {
            console.error(newMessageSaveError);
            throw newMessageSaveError;
        }
        User.updateMany({_id: {$in: req.group.administrators}}, {$push: {'messages.received': message}})
            .then(() => {
                User.findByIdAndUpdate(req.body.sendingUser, {$push: {'messages.sent': message}})
                    .then(() => {
                        res.send(message);
                    })
                    .catch(sendingUserError => {
                        console.error(sendingUserError)
                    });
            })
            .catch(receivingUsersError => {
                console.error(receivingUsersError);
            });
    });
});

groupRouter.delete("/:groupId", (req, res, next) => {
    Group.findByIdAndDelete(req.group._id, (err, group) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err
        }
        else {
            Deck.deleteMany({_id: {$in: req.group.decks}}, (err, deckDeleteResponse) => {
                if(err) {
                    res.status(500).send("There was an error deleting group's decks");
                    throw err;
                }
                //change activity to activities
                Activity.deleteMany({_id: {$in: req.group.activity}}, (err, activityDeleteResponse) => {
                    if(err) {
                        res.status(500).send("There was an error deleting group's activities")
                        throw err;
                    }
                    User.updateMany({_id: {$in: req.group.members}}, {$pull: {groups: req.group._id}}, (err, memberDeleteResponse) => {
                        if(err) {
                            res.status(500).send("There was an error removing the group from its member's groups arrays");
                            throw err;
                        }
                        User.updateMany({_id: {$in: req.group.administrators}}, {$pull: {adminOf: req.group._id}}, (err, adminDeleteResponse) => {
                            if(err) {
                                res.status(500).send("There was an error removing the group from its administrators' adminOf arrays");
                                throw err;
                            }
                        });
                    });
                });
            })
            res.status(200).send(group);
        }
    });
});

groupRouter.put("/:groupId", (req, res, next) => {
    Group.findByIdAndUpdate(req.group._id, req.body, {new:true}, (err, group) => {
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