import express from "express";
const userRouter = express.Router();

import User from "../models/user.js";
import Group from "../models/group.js";
import Deck from "../models/deck.js";
import Attempt from "../models/attempt.js";
import { Message } from "../models/message.js";
// import Notification from '../models/notification.js';
import { Notification } from '../models/notification.js';

userRouter.param("userId", (req, res, next, userId) => {
    User.findById(userId, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else if(!user) {
            res.status(404).send("User not found");
        } else {
            req.user = user;
            next();
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

userRouter.delete("/:userId", async (req, res, next) => {
    const userId = req.user._id
    try {
        await Group.updateMany({members: userId}, {$pull: {members: userId}});
        await Group.updateMany({administrators: userId}, {$pull: {administrators: userId}});
        await Deck.deleteMany({creator: userId});
        await Deck.updateMany({"permissions.view": userId}, {$pull: {"permissions.view": userId}});
        const deletedUser = await User.findByIdAndDelete(userId);
        await Attempt.deleteMany({_id: {$in: deletedUser.attempts}});
        res.status(200).send(userId);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

// userRouter.delete("/:userId", (req, res, next) => {
//     User.findByIdAndDelete(req.user._id, (err, user) => {
//         if(err) {
//             res.status(500).send("There was an error with your request");
//             throw err;
//         } else {
//             Group.updateMany({members: user._id}, {$pull: {members: user._id}})
//                 .catch((err) => {
//                     res.status(500).send("There was an error with your request");
//                     throw err;
//                 })
//                 // .then((err, matchedCount, modifiedCount, upsertedId) => {
//                 //     //all arguments passed to .then() are undefined
                
//                 //     console.log(`Matched count: ${matchedCount}`);
//                 //     console.log(`Modified count: ${modifiedCount}`);
//                 //     console.log(`Upserted id: ${upsertedId}`);
//                 // });
//                 .then(() => {
//                     console.log("done removing user from groups");
//                     Deck.deleteMany({creator: user._id})
//                         .catch(err => {
//                             if(err) {
//                                 res.status(500).send("There was an error with your request");
//                                 throw err;
//                             }
//                         })
//                         .then(() => {
//                             console.log("done removing decks created by user");
//                             Deck.updateMany({"permissions.view": user._id}, {$pull: {"permissions.view": user._id}})
//                                 .catch(err => {
//                                     if(err) {
//                                         res.status(500).send("There was an error with your request");
//                                         throw err;
//                                     }
//                                 })
//                                 .then(() => {
//                                     console.log("Done removing user from edit permissions");
//                                     Deck.updateMany({"permissions.edit": user._id}, {$pull: {"permissions.edit": user._id}})
//                                         .catch(err => {
//                                             if(err) {
//                                                 res.status(500).send("There was an error with your request");
//                                                 throw err;
//                                             }
//                                         })
//                                         .then(() => {
//                                             console.log("Done removing user from edit permissions");
//                                             Attempt.deleteMany({_id: {$in: user.attempts}})
//                                                 .catch(err => {
//                                                     if(err) {
//                                                         res.status(500).send("There was an error with your request");
//                                                     }
//                                                 })
//                                                 .then(() => {
//                                                     console.log("Done removing user's attempts");
//                                                     res.status(200).send(user);
//                                                 });
//                                         })
//                                 })
//                         })
//                 })    
//         }
//     });
// });

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

userRouter.post("/:userId/decks", async (req, res, next) => {
    try {
        let newDeck = new Deck({
            name: req.body.deckName,
            public: req.body.public,
            creator: req.body.creator,
        });
        const deck = await newDeck.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {decks: deck}});
        res.status(200).send({_id: deck._id, name: deck.name});
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

// userRouter.post("/:userId/decks", (req, res, next) => {
//     let newDeck = new Deck({
//         name: req.body.deckName,
//         public: req.body.public,
//         creator: req.body.creator,
//     });
//     newDeck.save((err, deck) => {
//         User.findByIdAndUpdate(req.user._id, {$push: {decks: deck}}, (err, user) => {
//             if(err) {
//                 res.status(500).send("There was an error with your request");
//             } else {
//                 res.status(200).send({_id: newDeck._id, name: newDeck.name});
//             }
//         });
//     });
// });

userRouter.post("/:userId/messages", async (req, res, next) => {
    try {
        let newMessage = new Message();
        newMessage.type = req.body.type;
        newMessage.sendingUser = req.body.sendingUser;
        newMessage.targetDeck = req.body.targetDeck;
        newMessage.targetGroup = req.body.targetGroup;
        const message = await newMessage.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {'messages.received': message}});
        await User.findByIdAndUpdate(message.sendingUser, {$push: {'messages.sent': message}});
        res.status(200).send(message);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw receivingUserErr;
    }
});

// userRouter.post("/:userId/messages", (req, res, next) => {
//     let newMessage = new Message();
//     newMessage.type = req.body.type;
//     newMessage.sendingUser = req.body.sendingUser;
//     newMessage.targetDeck = req.body.targetDeck;
//     newMessage.targetGroup = req.body.targetGroup;
//     newMessage.save((messageSaveErr, message) => {
//         if(messageSaveErr) {
//             res.status(500).send("There was an error with your request");
//             throw messageSaveErr;
//         }
//         User.findByIdAndUpdate(req.user._id, {$push: {'messages.received': message}})
//             .then(() => {
//                 User.findByIdAndUpdate(message.sendingUser, {$push: {'messages.sent': message}})
//                     .then(() => res.status(200).send(message))
//                     .catch(senderUpdateErr => {
//                         res.status(500).send("There was an error with your request");
//                         throw(senderUpdateErr);
//                     });
//             })
//             .catch(receivingUserErr => {
//                 res.status(500).send("There was an error with your request");
//                 throw receivingUserErr;
//             });
//     });
// });

userRouter.delete("/:userId/messages/:messageId", async (req, res, next) => {
    try {
        const messageId = req.params.messageId;
        if(req.user.messages.sent.findIndex(messageId) > -1) {
            await User.findByIdAndUpdate(req.user._id, {$pull: {'messages.sent': messageId}});
        } else if (req.user.messages.received.findIndex(messageId) > -1) {
            await User.findByIdAndUpdate(req.user._id, {$pull: {'messages.received': messageId}});
        } else {
            res.status(404).send("Message not found in user's messages");
            throw err;
        } 
        await Message.findByIdAndDelete(messageId);
        res.status(200).send(messageId);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

// userRouter.delete("/:userId/messages/:messageId", (req, res, next) => {
//     Message.findByIdAndDelete(req.params.messageId)
//         .then(message => {
//             if(req.user.messages.sent.findIndex(message._id) > -1) {
//                 User.findByIdAndUpdate(req.user._id, {$pull: {'messages.sent': message._id}})
//                     .then(res.status(200).send(message))
//                     .catch(sentDeleteErr => {
//                         res.status(500).send("There was an error with your request");
//                         throw sentDeleteErr;
//                     })
//             } else if(req.user.messages.received.findIndex(message._id) > -1) {
//                 User.findByIdAndUpdate(req.user._id, {$pull: {'messages.received': message._id}})
//                     .then(res.status(200).send(message))
//                     .catch(receivedDeleteErr => {
//                         res.status(500).send("There was an error with your request");
//                         throw receivedDeleteErr;
//                     })
//             } else {
//                 res.status(404).send("Message not found in user's messages");
//             }
            
//         })
//         .catch(messageDeleteErr => {
//             res.status(500).send("There was an error with your request");
//             throw messageDeleteErr;
//         });
// });

userRouter.post("/:userId/notifications", async (req, res, next) => {
    try {
        let newNotification = new Notification();
        newNotification.type = req.body.type;
        newNotification.content = req.body.content;
        newNotification.actor = req.body.actor;
        newNotification.groupTarget = req.body.groupTarget;
        newNotification.deckTarget = req.body.deckTarget;
        newNotification.cardTarget = req.body.cardTarget;
        newNotification.read = req.body.read;
        const notification = await newNotification.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {notifications: notification}});
        res.status(200).send(notification);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }

});

// userRouter.post("/:userId/notifications", (req, res, next) => {
//     let newNotification = new Notification();
//     newNotification.type = req.body.type;
//     newNotification.content = req.body.content;
//     newNotification.actor = req.body.actor;
//     newNotification.groupTarget = req.body.groupTarget;
//     newNotification.deckTarget = req.body.deckTarget;
//     newNotification.cardTarget = req.body.cardTarget;
//     newNotification.read = req.body.read;
//     newNotification.save((notificationSaveErr, notification) => {
//         if(notificationSaveErr) {
//             res.status(500).send("There was an error with your request");
//             throw notificationSaveErr;
//         }
//         User.findByIdAndUpdate(req.user._id, {$push: {notifications: notification}})
//             .then(notification => {
//                 res.status(200).send(notification);
//             })
//             .catch(userUpdateErr => {
//                 res.status(500).send("There was an error with your request");
//                 throw userUpdateErr;
//             });
//     });
// });

userRouter.put("/:userId/notifications", (req, res, next) => {
    Notification.updateMany({_id: {$in: req.user.notifications}}, {$set: {read: true}})
        //may not need to send anything back here, may need to send back certain number of notifications
        .then(res.status(200).send())
        .catch(err => {
            res.status(500).send("There was an error with your request");
            throw err;
        });
});

userRouter.patch("/:userId", async (req, res, next) => {
    let patchObj = {...req.body};
    if(patchObj.login.username) {
        patchObj.login.password = req.user.login.password;
    }
    console.log({patchObj});
    try {
        const user = await User.findByIdAndUpdate(req.user._id, patchObj, {new: true});
        // delete user.login.password;
        res.status(200).send(user);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw(err);
    }
});

userRouter.post("/:userId/attempts", async (req, res, next) => {
    try {
        const newAttempt = new Attempt(req.body);
        const attempt = await newAttempt.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {attempts: attempt}});
        res.status(200).send(attempt);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});
// userRouter.post("/:userId/attempts", (req, res, next) => {
//     let newAttempt = new Attempt(req.body);
//     newAttempt.save((err, attempt) => {
//         User.findByIdAndUpdate(req.user._id, {$push: {attempts: attempt}}, (err, user) => {
//             if(err) {
//                 res.status(500).send("There was an error with your request");
//                 throw err;
//             } else {
//                 res.status(200).send(attempt);
//             }
//         });
//     });
// });

userRouter.delete("/:userId/attempts/:attemptId", async (req, res, next) => {
    const attemptId = req.params.attemptId;
    try {
        await User.findByIdAndUpdate(req.user._id, {$pull: {attempts: attemptId}});
        await Attempt.findByIdAndDelete(attemptId);
        res.status(200).send(attemptId);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

// userRouter.delete("/:userId/attempts/:attemptId", (req, res, next) => {
//     User.findByIdAndUpdate(req.user._id, {$pull: {attempts: req.params.attemptId}}, (err, user) => {
//         if(err) {
//             res.status(500).send("There was an error with your request");
//             throw err;
//         } else {
//             Attempt.findByIdAndDelete(req.params.attemptId, (err, attempt) => {
//                 if(err) {
//                     res.status(500).send("There was an error with your request");
//                     throw err;
//                 } else {
//                     res.status(200).send(attempt);
//                 } 
//             });
//         }
//     });
// });

userRouter.delete("/:userId/attempts", async (req, res, next) => {
    try {
        const deletedAttempts = await Attempt.deleteMany({_id: req.user.attempts});
        await User.findByIdAndUpdate(req.user._id, {$set: {attempts: []}});
        res.status(200).send(deletedAttempts.deletedCount);
    } catch (err) {
        res.status(500).send("There was an error with your request");
    }
});

// userRouter.delete("/:userId/attempts", (req, res, next) => {
//     Attempt.deleteMany({_id: req.user.attempts}, (err, deletedAttemptsObj) => {
//         if(err) {
//             res.status(500).send("There was an error with your request");
//             throw err;
//         } else {
//             User.findByIdAndUpdate(req.user._id, {$set: {attempts: []}}, (err, user) => {
//                 if(err) {
//                     res.status(500).send("There was an error with your request");
//                     throw err;
//                 } else {
//                     res.status(200).send(JSON.stringify(deletedAttemptsObj.deletedCount));
//                 }
//             });
//         }
//     });
// });

userRouter.delete("/:userId/decks/:deckId/attempts", async (req, res, next) => {
    try {
        const attempts = await Attempt.find({$and: [{_id: {$in: req.user.attempts}}, {deck: req.params.deckId}]});
        let attemptIds = attempts.map(attempt => attempt._id);
        await User.findByIdAndUpdate(req.user._id, {$pull: {attempts: {$in: attemptIds}}});
        const deletedAttempts = await Attempt.deleteMany({_id: {$in: attemptIds}});
        res.status(200).send(deletedAttempts.deletedCount);
    } catch (err) {
        res.status(500).send("There was an error with your request");
    }
});

// userRouter.delete("/:userId/decks/:deckId/attempts", (req, res, next) => {
//     Attempt.find({$and: [{_id: {$in: req.user.attempts}}, {deck: req.params.deckId}]}, (err, attempts) => {
//         if(err) {
//             res.status(500).send("There was an error with your request");
//             throw err;
//         } else {
//             let attemptIds = attempts.map(attempt => attempt._id);
//             Attempt.deleteMany({_id: {$in: attemptIds}}, (err, deletedAttemptsObj) => {
//                 if(err) {
//                     res.status(500).send("There was an error with your request");
//                     throw err;
//                 } else {
//                     User.findByIdAndUpdate(req.user._id, {$pull: {attempts: {$in: attemptIds}}}, (err, user) => {
//                         if(err) {
//                             res.status(500).send("There was an error with your request");
//                             throw err;
//                         } else {
//                             res.status(200).send(JSON.stringify(deletedAttemptsObj.deletedCount));
//                         }
//                     });
//                 }
//             });
//         }
//     });
// });


export default userRouter;