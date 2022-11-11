import express from "express";
const groupRouter = express.Router();

import Activity from "../models/activity.js";
import { Card, FlashCard, MultipleChoiceCard, TrueFalseCard } from "../models/card.js";
// import deck from "../models/deck.js";
import Deck from "../models/deck.js";
import Group from "../models/group.js";
import { DeckSubmission, JoinRequest } from "../models/message.js";
import { JoinDecision } from "../models/notification.js";
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

groupRouter.get("/search", async (req, res, next) => {
    const regex = new RegExp(req.query.entry, 'i');
    const user = await User.findById(req.query.id, "groups messages.sent");
    let populatedUser = await user.populate("messages.sent");
    let groups = await Group.find({name: {$regex: regex}});
    let filteredGroups = groups.filter(group => !populatedUser.groups.includes(group._id) && !populatedUser.messages.sent.map(message => message.targetGroup.toString()).includes(group._id.toString()));
    res.status(200).send(filteredGroups);
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
            req.group.joinCode = 'only admins can view join codes';
        } else if(!req.group.members.includes(req.query.requestingUser)) {
            res.status(401).send("Unauthorized: Only members of this group may view its page");
        }
        response = req.group;
    } else {
        res.status(401).send("Unauthorized: Only members of this group may view its page");
    }
    res.status(200).send(response);
});

groupRouter.get("/:groupId/join-options", (req, res, next) => {
    res.status(200).send({
        joinOptions: req.group.joinOptions
    })
});

groupRouter.get("/:groupId/decks", (req, res, next) => {
    res.status(200).send(JSON.stringify(req.group.decks));
});

groupRouter.post("/:groupId/decks", async (req, res, next) => {
    if(req.query.approved) {
        try {
            let foundDeck = await Deck.findById(req.body.idOfDeckToCopy);
            let deckCopy = new Deck();
            console.log(`new deck id: ${deckCopy._id}`);
            deckCopy.name = foundDeck.name;
            deckCopy.publiclyAvailable = false;
            deckCopy.creator = foundDeck.creator;
            // deckCopy.cards = foundDeck.cards;
            deckCopy.permissions = foundDeck.permissions;
            let cardsCopy = [];        

            for(let i = 0; i < foundDeck.cards.length; i++) {
                cardsCopy.push(new Promise((resolve, reject) => {                    
                    Card.findById(foundDeck.cards[i], (cardFindErr, foundCard) => {
                        if(cardFindErr) {
                            err.message = "couldn't find card";
                            err.status = 404;
                            // res.status(500).send("There was an error with your request");/////////////////////////////////////////
                            throw err;
                        }
                        switch(foundCard.cardType) {
                            case "FlashCard":
                                console.log("flash card found");
                                FlashCard.findById(foundCard._id)
                                .then(foundFlashCard => {
                                    delete foundFlashCard._id;
                                    foundFlashCard.stats = {
                                        numberCorrect: 0,
                                        numberIncorrect: 0
                                    }
                                    let flashCardCopy = new FlashCard(foundFlashCard);
                                    flashCardCopy.save((cardSaveErr, card) => {
                                        console.log("card copy saved");
                                        if(cardSaveErr) {
                                            cardSaveErr.message = "There was an error with your flash card save request";
                                            cardSaveErr.status = 500;
                                            // res.status(500).send("There was an error with your flash request");////////////////////////////////////
                                            throw cardSaveErr;
                                        }
                                        resolve(card);
                                    });
                                })
                                .catch(err => {
                                    err.message = "There was an error with your flash request";
                                    err.status = 500;
                                    throw err;
                                });
                                break;
                            case "TrueFalseCard":
                                console.log("true/false card found");
                                TrueFalseCard.findById(foundCard._id)
                                .then(foundTrueFalseCard => {
                                    delete foundTrueFalseCard._id;
                                    foundTrueFalseCard.stats = {
                                        numberCorrect: 0,
                                        numberIncorrect: 0
                                    }
                                    let trueFalseCardCopy = new TrueFalseCard(foundTrueFalseCard);
                                    trueFalseCardCopy.save((cardSaveErr, card) => {
                                        console.log("card copy saved");
                                        if(cardSaveErr) {
                                            cardSaveErr.message = "There was an error with your true false save request";
                                            cardSaveErr.status = 500;
                                            // res.status(500).send("There was an error with your add true false card request");/////////////////////////////////////////////
                                            throw cardSaveErr;
                                        }
                                        resolve(card);
                                    });
                                })
                                .catch(err => {
                                    err.message = "There was an error with your true false request";
                                    err.status = 500;
                                    throw err;
                                });
                                break;
                            case "MultipleChoiceCard":
                                console.log("multiple choice card found");
                                MultipleChoiceCard.findById(foundCard._id)
                                .then(foundMultipleChoiceCard => {
                                    delete foundMultipleChoiceCard._id;
                                    foundMultipleChoiceCard.stats = {
                                        numberCorrect: 0,
                                        numberIncorrect: 0
                                    }
                                    let multipleChoiceCardCopy = new MultipleChoiceCard(foundMultipleChoiceCard);
                                    multipleChoiceCardCopy.save((cardSaveErr, card) => {
                                        console.log("card copy saved");
                                        if(cardSaveErr) {
                                            cardSaveErr.message = "There was an error with your mulitple choice save request";
                                            cardSaveErr.status = 500;
                                            // res.status(500).send("There was an error with your add multiple choice card request");
                                            throw cardSaveErr;
                                        }
                                        resolve(card);
                                    });
                                })
                                .catch(err => {
                                    err.message = "There was an error with your multiple choice request";
                                    err.status = 500;
                                    throw err;
                                });
                                break;
                            default: 
                                let err = new Error();
                                err.message = "Invalid card type selected";
                                err.status = 500;
                                throw err;
                        }
                        // let newCard = new Card();
                        // newCard.creator = foundCard.creator;
                        // newCard.type = foundCard.type;
                        // newCard.question = foundCard.question;
                        // newCard.correctAnswer = foundCard.correctAnswer;
                        // newCard.wrongAnswerOne = foundCard.wrongAnswerOne;
                        // newCard.wrongAnswerTwo = foundCard.wrongAnswerTwo;
                        // newCard.wrongAnswerThree = foundCard.wrongAnswerThree;
                        // newCard.hint = foundCard.hint;
                        // newCard.stats = {
                        //     numberCorrect: 0,
                        //     numberIncorrect: 0
                        // }
                        // newCard.save((cardSaveErr, card) => {
                        //     console.log("card copy saved");
                        //     if(cardSaveErr) {
                        //         res.status(500).send("There was an error with your request");
                        //         throw cardSaveErr;
                        //     }
                        //     resolve(card);
                        // });
                    });
                }));
            }

            const cards = await Promise.all(cardsCopy);
            console.log("all cards copied over");
            deckCopy.cards = cards;
            console.log(deckCopy);
            let savedDeck = await deckCopy.save();            
            console.log('deckCopy saved');
            let newActivity = new Activity();
            newActivity.actor = savedDeck.creator;
            newActivity.type = "add-deck";
            newActivity.groupTarget = req.group._id;
            console.log(`savedDeckId: ${savedDeck._id}, deckCopyId: ${deckCopy._id}`);
            newActivity.deckTarget = savedDeck._id;
            const activity = await newActivity.save();
            console.log(activity);
            console.log('activity saved');

            await Group.findByIdAndUpdate(req.group._id, {$push: {decks: deckCopy._id, activities: activity._id}});
            console.log("group updated");
            res.status(200).send({
                newDeck: deckCopy._id,
                newActivity: activity._id
            });
        } catch (err) {
            console.log("error caught");
            res.status(err.status ?? 500).send(err.message);
            throw err;
        }
        
    } else {
        console.log("big else condition met");
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

//Patch? Delete? If Patch should I use the same route for adding and removing members and do logic to decide whether to push or pull in update obj?
groupRouter.patch("/:groupId/members", async (req, res, next) => {
    //necessary to do this check since it would take Postman or something to send a request with a member Id not in the group?
    if(req.group.members.includes(req.body.memberToRemoveId)) {
        //Is this truly secure? Admin ids are exposed in devtools...
        //also, may need to split this into two ifs so notification can be sent if an admin removes a group member
        if(req.group.members.includes(req.body.requesterId) || req.group.administrators.includes(req.body.requesterId)) {
            try {
                await Group.findByIdAndUpdate(req.group._id, {$pull: {members: req.body.memberToRemoveId, administrators: req.body.memberToRemoveId}});
                const updatedUser = await User.findByIdAndUpdate(req.body.memberToRemoveId, {$pull: {groups: req.group._id, adminOf: req.group._id}});
                res.status(200).send(updatedUser._id);
            } catch (err) {
                res.status(500).send(err.message);
                throw err;
            }
        } else {
            res.status(403).send("You do not have the authority to remove this member");
        }
    } else {
        res.status(404).send("Cannot remove member because member not found");
    }
});

groupRouter.patch("/:groupId/admins", async (req, res, next) => {
    if(req.group.administrators.includes(req.body.adminId)) {
        try {
            let user = await User.findById(req.body.userId);
            if(user && req.group.members.includes(user._id)) {
                let updatedUser;
                if(req.body.action === "add") {
                    //need to create notification here eventually
                    await Group.findByIdAndUpdate(req.group._id, {$push: {administrators: user._id}});
                    updatedUser = await User.findByIdAndUpdate(user._id, {$push: {adminOf: req.group._id}});
                } else if(req.body.action === "remove") {
                    //need to create notification here eventually
                    await Group.findByIdAndUpdate(req.group._id, {$pull: {administrators: user._id}});
                    updatedUser = await User.findByIdAndUpdate(user._id, {$pull: {adminOf: req.group._id}});
                } else {
                    res.status(500).send("There was an error with your request");
                }
                res.status(200).send(updatedUser._id);
            } else {
                res.status(404).send("User not found in selected group");
            }
        } catch (err) {
            res.status(500).send(err.message);
            throw err;
        }
    } else {
        res.status(403).send("Only authorized users can designate adminstrator authority");
    }
});

groupRouter.post("/:groupId/messages/admin/join-request", async (req, res, next) => {
    try {
        let newMessage = new JoinRequest();
            newMessage.acceptanceStatus = 'pending';
            newMessage.sendingUser = req.body.sendingUser;
            newMessage.targetGroup = req.body.targetGroup;
            let message = await newMessage.save();

            await User.updateMany({_id: {$in: req.group.administrators}}, {$push: {'messages.received': message}});
            await User.findByIdAndUpdate(req.body.sendingUser, {$push: {'messages.sent': message}});
            res.status(200).send(message._id);
    } catch(err) {
        res.status(500).send("There was an error sending the join request to the group admins");
    }
});

groupRouter.post("/:groupId/messages/admin/deck-submission", async (req, res, next) => {
    try {
        let newMessage = new DeckSubmission();
        newMessage.acceptanceStatus = 'pending';
        newMessage.sendingUser = req.body.sendingUser;
        newMessage.targetDeck = req.body.targetDeck;
        newMessage.targetGroup = req.body.targetGroup;
        let message = await newMessage.save();
        await User.updateMany({_id: {$in: req.group.administrators}}, {$push: {'messages.received': message}});
        await User.findByIdAndUpdate(req.body.sendingUser, {$push: {'messages.sent': message}});
        res.status(200).send(message);
    } catch (err) {
        res.status(500).send("There was an error updating receiving admins received messages");
        throw err;
    }
});

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

// groupRouter.post("/:groupId/members", async (req, res, next) => {
//     try {
//         const user = await User.findById(req.body.userId);
//         await Group.findByIdAndUpdate(req.group._id, {$addToSet: {members: user._id}});
//         res.status(200).send(user._id);
//     } catch (err) {
//         res.status(500).send("There was an error with your request");
//         throw err;
//     }
// });

groupRouter.post("/:groupId/members/join-code", async(req, res, next) => {
    console.log("join-code route hit");
    console.log({group: req.group});
    try {
        const user = await User.findById(req.body.userId);
        console.log({user});
        if(user && req.body.joinCode === req.group.joinCode) {
            console.log("join codes match");
            const updatedGroup = await Group.findByIdAndUpdate(req.group._id, {$addToSet: {members: user._id}}, {new: true});
            await User.findByIdAndUpdate(req.body.userId, {$addToSet: {groups: updatedGroup._id}});
            //create new notification here to send to all members of the group
            res.status(200).send(updatedGroup._id);
        } else {
            res.status(404).send("Invalid join code");
        }
    } catch (err) {
        res.status(500).send("There was an error with your request");
    }
});

groupRouter.post("/:groupId/members/request", async(req, res, next) => {
    console.log("request route hit");
    try {
        if(req.group.administrators.includes(req.body.adminId)) {
            const user = await User.findById(req.body.newMember);
            await Group.findByIdAndUpdate(req.group._id, {$addToSet: {members: user._id}}, {new: true});
            await User.findByIdAndUpdate(user._id, {$addToSet: {groups: req.group._id}});
            res.status(200).send(user._id);
            // let newNotification = new JoinDecision({
            //     decision: "approved", 
            //     groupTarget: req.group._id
            // });
            // newNotification.save((err, savedNotification) => {
            //     User.findByIdAndUpdate(user._id, {$push: {notifications: savedNotification}});
            //     res.status(200).send("Member successfully added");
            // })
        } else {
            res.status(400).send("You are not authorized to add a member to this group");
        }
        
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