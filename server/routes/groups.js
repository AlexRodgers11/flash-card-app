import express from "express";
const groupRouter = express.Router();

import Activity from "../models/activity.js";
import Card from "../models/card.js";
import deck from "../models/deck.js";
import Deck from "../models/deck.js";
import Group from "../models/group.js";
import { DeckSubmission, JoinRequest } from "../models/message.js";
import User from "../models/user.js";

groupRouter.param("groupId", (req, res, next, groupId) => {
    Group.findById(groupId, (err, group) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else if(!group) {
            res.status(404).send("Group not found");
        } else {
            req.group = group;
            next();
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
        } else if(!req.group.members.includes(req.query.requestingUser)) {
            res.status(401).send("Unauthorized: Only members of this group may view its page");
        }
        response = req.group;
    } else {
        res.status(401).send("Unauthorized: Only members of this group may view its page");
    }
    res.status(200).send(response);
});

groupRouter.get("/:groupId/decks", (req, res, next) => {
    res.status(200).send(JSON.stringify(req.group.decks));
});

groupRouter.post("/:groupId/decks", async (req, res, next) => {
    if(req.query.approved) {
        try {
            let foundDeck = await Deck.findById(req.body.idOfDeckToCopy);
            let deckCopy = new Deck();
            deckCopy.name = foundDeck.name;
            deckCopy.publiclyAvailable = false;
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

            const cards = await Promise.all(cardsCopy);
            console.log("all cards copied over");
            deckCopy.cards = cards;
            await deck.save();            

            let newActivity = new Activity();
            newActivity.actor = deck.creator;
            newActivity.type = "add-deck";
            newActivity.groupTarget = req.group._id;
            newActivity.deckTarget = deck._id;
            const activity = await newActivity.save();

            await Group.findByIdAndUpdate(req.group._id, {$push: {decks: deck._id, activities: activity._id}})
            res.status(200).send({
                newDeck: deck._id,
                newActivity: activity._id
            });
        } catch (err) {
            res.status(500).send("There was an error with your request");
            throw err;
        }
        
    } else {
        try {
            let newDeck = new Deck()
            newDeck.name = req.body.name;
            newDeck.publiclyAvailable = req.body.publiclyAvailable || false;
            newDeck.creator = req.body.creator;
            newDeck.cards = req.body.cards;
            newDeck.permissions = req.body.permissions;
            const deck = await newDeck.save();

            let newActivity = new Activity();
            newActivity.actor = req.body.creator;
            newActivity.type = "add-deck";
            newActivity.groupTarget = req.group._id;
            newActivity.deckTarget = deck._id
            const activity = await newActivity.save();
            await Group.findByIdAndUpdate(req.group._id, {$push: {decks: deck._id, activities: activity._id}});
            res.status(200).send({
                newDeck: deck._id,
                newActivity: activity._id
            });
        } catch (err) {
            res.status(500).send("There was an error with your request");
            throw err;
        }
    }
    
});

// groupRouter.post("/:groupId/decks", (req, res, next) => {
//     if(req.query.approved) {
//         Deck.findById(req.body.idOfDeckToCopy)
//             .then(foundDeck => {
//                 let deckCopy = new Deck();
//                 deckCopy.name = foundDeck.name;
//                 deckCopy.publiclyAvailable = foundDeck.publiclyAvailable || false;
//                 deckCopy.creator = foundDeck.creator;
//                 deckCopy.cards = foundDeck.cards;
//                 deckCopy.permissions = foundDeck.permissions;
//                 let cardsCopy = [];
//                 for(let i = 0; i < foundDeck.cards.length; i++) {
//                     cardsCopy.push(new Promise((resolve, reject) => {
//                         Card.findById(foundDeck.cards[i], (cardFindErr, foundCard) => {
//                             if(cardFindErr) {
//                                 res.status(500).send("There was an error with your request");
//                                 throw err;
//                             }
//                             let newCard = new Card();
//                             newCard.creator = foundCard.creator;
//                             newCard.type = foundCard.type;
//                             newCard.question = foundCard.question;
//                             newCard.correctAnswer = foundCard.correctAnswer;
//                             newCard.wrongAnswerOne = foundCard.wrongAnswerOne;
//                             newCard.wrongAnswerTwo = foundCard.wrongAnswerTwo;
//                             newCard.wrongAnswerThree = foundCard.wrongAnswerThree;
//                             newCard.hint = foundCard.hint;
//                             newCard.stats = {
//                                 numberCorrect: 0,
//                                 numberIncorrect: 0
//                             }
//                             newCard.save((cardSaveErr, card) => {
//                                 console.log("card copy saved");
//                                 if(cardSaveErr) {
//                                     res.status(500).send("There was an error with your request");
//                                     throw cardSaveErr;
//                                 }
//                                 resolve(card);
//                             });
//                         });
//                     }));
//                 }
//                 Promise.all(cardsCopy).then(cards => {
//                     console.log("all cards coppied over");
//                     deckCopy.cards = cards;
//                     deckCopy.save((err, deck) => {
//                         if(err) {
//                             res.status(500).send("There was an error with your request");
//                             throw err;
//                         } else {
//                             let newActivity = new Activity();
//                             // newActivity.actor = req.body.actor;
//                             newActivity.actor = deck.creator;
//                             newActivity.type = "add-deck";
//                             newActivity.groupTarget = req.group._id;
//                             newActivity.deckTarget = deck._id
//                             newActivity.save((err, activity) => {
//                                 if(err) {
//                                     res.status(500).send("There was an error with your request");
//                                     throw err;
//                                 } else {
//                                     console.log({activity});
//                                     console.log({deck});
//                                         Group.findByIdAndUpdate(req.group._id, {$push: {decks: deck._id, activity: activity._id}})
//                                     .then(() => {
//                                         res.status(200).send({
//                                             newDeck: deck._id,
//                                             newActivity: activity._id
//                                         });
//                                     })
//                                     .catch(err => {
//                                         console.error(err);
//                                         res.status(500).send("There was an error with your request");
//                                     })
//                                 }
//                             });
//                         }
//                     }); 
//                 })
//                 .catch(copyCardsPromiseErr => {
//                     res.status(500).send("There was an error with your request");
//                     throw copyCardsPromiseErr;
//                 });
//             })
//             .catch(error => {
//                 console.error(error);
//                 throw error;
//             })
//     } else {
//         let newDeck = new Deck()
//         newDeck.name = req.body.name;
//         newDeck.publiclyAvailable = req.body.publiclyAvailable || false;
//         newDeck.creator = req.body.creator;
//         newDeck.cards = req.body.cards;
//         newDeck.permissions = req.body.permissions;
//         newDeck.save((err, deck) => {
//             if(err) {
//                 console.error(err);
//                 res.status(500).send("There was an error with your request");
//                 throw err;
//             } else {
//                 let newActivity = new Activity();
//                 newActivity.actor = req.body.creator;
//                 newActivity.type = "add-deck";
//                 newActivity.groupTarget = req.group._id;
//                 newActivity.deckTarget = deck._id
//                 newActivity.save((err, activity) => {
//                     if(err) {
//                         res.status(500).send("There was an error with your request");
//                         throw err;
//                     } else {
//                         console.log({activity});
//                         console.log({deck});
//                             Group.findByIdAndUpdate(req.group._id, {$push: {decks: deck._id, activity: activity._id}})
//                         .then(() => {
//                             res.status(200).send({
//                                 newDeck: deck._id,
//                                 newActivity: activity._id
//                             });
//                         })
//                         .catch(err => {
//                             console.error(err);
//                             res.status(500).send("There was an error with your request");
//                         })
//                     }
//                 });
//             }
//         }); 
//     }
    
// });

groupRouter.post("/:groupId/messages/admin", async (req, res, next) => {
    try {
        if(req.body.requestType === 'DeckSubmission') {
            let newMessage = new DeckSubmission();
            newMessage.acceptanceStatus = 'pending';
            newMessage.sendingUser = req.body.sendingUser;
            newMessage.targetDeck = req.body.targetDeck;
            newMessage.targetGroup = req.body.targetGroup;
            let message = await newMessage.save();
            await User.updateMany({_id: {$in: req.group.administrators}}, {$push: {'messages.received': message}});
            await User.findByIdAndUpdate(req.body.sendingUser, {$push: {'messages.sent': message}});
        } else if(req.body.requestType === 'JoinRequest') {
            let newMessage = new JoinRequest();
            newMessage.acceptanceStatus = 'pending';
            newMessage.sendingUser = req.body.sendingUser;
            newMessage.targetGroup = req.body.targetGroup;
            let message = await newMessage.save();

            await User.updateMany({_id: {$in: req.group.administrators}}, {$push: {'messages.received': message}});
            await User.findByIdAndUpdate(req.body.sendingUser, {$push: {'messages.sent': message}});
        } else {}
    } catch (err) {
        res.status(500).send("There was an error updating receiving admins received messages");
        throw receivingUsersError;
    }
    
});

// groupRouter.post("/:groupId/messages/admin", (req, res, next) => {
//     if(req.body.requestType === 'DeckSubmission') {
//         let newMessage = new DeckSubmission();
//         newMessage.acceptanceStatus = 'pending';
//         newMessage.sendingUser = req.body.sendingUser;
//         newMessage.targetDeck = req.body.targetDeck;
//         newMessage.targetGroup = req.body.targetGroup;
//         newMessage.save((newMessageSaveError, message) => {
//             if(newMessageSaveError) {
//                 res.status(500).send("There was an error saving the new message");
//                 throw newMessageSaveError;
//             }
//             User.updateMany({_id: {$in: req.group.administrators}}, {$push: {'messages.received': message}})
//                 .then(() => {
//                     User.findByIdAndUpdate(req.body.sendingUser, {$push: {'messages.sent': message}})
//                         .then(() => {
//                             res.send(message);
//                         })
//                         .catch(sendingUserError => {
//                             res.status(500).send("There was an error sending user's sent messages")
//                             throw sendingUserError;
//                         });
//                 })
//                 .catch(receivingUsersError => {
//                     res.status(500).send("There was an error updating receiving admins received messages");
//                     throw receivingUsersError;
//                 });
//         });
//     } else if(req.body.requestType === 'JoinRequest') {
//         let newMessage = new JoinRequest();
//         newMessage.acceptanceStatus = 'pending';
//         newMessage.sendingUser = req.body.sendingUser;
//         newMessage.targetGroup = req.body.targetGroup;
//         newMessage.save((err, message) => {
//             if(err) {
//                 res.status(500).send("There was an error with your requests");
//                 throw err;
                
//             }
//             User.updateMany({_id: {$in: req.group.administrators}}, {$push: {'messages.received': message}})
//                 .then(() => {
//                     User.findByIdAndUpdate(req.body.sendingUser, {$push: {'messages.sent': message}})
//                         .then(() => {
//                             res.send(message);
//                         })
//                         .catch(sendingUserError => {
//                             res.status(500).send("There was an error sending user's sent messages")
//                             throw sendingUserError;
//                         });
//                 })
//                 .catch(receivingUsersError => {
//                     res.status(500).send("There was an error updating receiving admins received messages");
//                     throw receivingUsersError;
//                 });            
//         });
//     } else {}
// });

groupRouter.delete("/:groupId", async (req, res, next) => {
    try {
        const group = await Group.findByIdAndDelete(req.group._id);
        await Deck.deleteMany({_id: {$in: req.group.decks}});
        await Activity.deleteMany({_id: {$in: req.group.activities}});
        await User.updateMany({_id: {$in: req.group.members}}, {$pull: {groups: req.group._id}});
        await User.updateMany({_id: {$in: req.group.administrators}}, {$pull: {adminOf: req.group._id}});
        res.status(200).send(group);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err
    }
});

// groupRouter.delete("/:groupId", (req, res, next) => {
//     Group.findByIdAndDelete(req.group._id, (err, group) => {
//         if(err) {
//             res.status(500).send("There was an error with your request");
//             throw err
//         }
//         else {
//             Deck.deleteMany({_id: {$in: req.group.decks}}, (err, deckDeleteResponse) => {
//                 if(err) {
//                     res.status(500).send("There was an error deleting group's decks");
//                     throw err;
//                 }
//                 //change activity to activities
//                 Activity.deleteMany({_id: {$in: req.group.activity}}, (err, activityDeleteResponse) => {
//                     if(err) {
//                         res.status(500).send("There was an error deleting group's activities")
//                         throw err;
//                     }
//                     User.updateMany({_id: {$in: req.group.members}}, {$pull: {groups: req.group._id}}, (err, memberDeleteResponse) => {
//                         if(err) {
//                             res.status(500).send("There was an error removing the group from its member's groups arrays");
//                             throw err;
//                         }
//                         User.updateMany({_id: {$in: req.group.administrators}}, {$pull: {adminOf: req.group._id}}, (err, adminDeleteResponse) => {
//                             if(err) {
//                                 res.status(500).send("There was an error removing the group from its administrators' adminOf arrays");
//                                 throw err;
//                             }
//                         });
//                     });
//                 });
//             })
//             res.status(200).send(group);
//         }
//     });
// });

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

groupRouter.post("/:groupId/members", async (req, res, next) => {
    try {
        const user = await User.findById(req.body.user);
        await Group.findByIdAndUpdate(req.group._id, {$addToSet: {members: user._id}});
        res.status(200).send(user._id);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

// groupRouter.post("/:groupId/members", (req, res, next) => {
//     User.findById(req.body.user, (err, user) => {
//         if(err) {
//             res.status(500).send("There was an error with your request");
//             throw err;
//         } else if(!user) {
//             res.status(404).send("User not found");
//         } else {
//             Group.findByIdAndUpdate(req.group._id, {$addToSet: {members: user._id}}, (err, group) => {
//                 if(err) {
//                     res.status(500).send("There was an error with your request");
//                     throw err;
//                 } else {
//                     res.status(200).send(user._id);
//                 }
//             });
//         }
//     });
// });

export default groupRouter;