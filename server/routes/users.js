import express from "express";
const userRouter = express.Router();

import CardAttempt from "../models/cardAttempt.js";
import User from "../models/user.js";
import Group from "../models/group.js";
import Deck from "../models/deck.js";
import DeckAttempt from "../models/deckAttempt.js";
import { DeckDecision, DeckSubmission, Message } from "../models/message.js";
// import { CardDecision, DeckDecision, JoinDecision, Notification } from '../models/notification.js';
import { CardDecision, JoinDecision, Notification } from '../models/notification.js';
import { generateRandomFileName } from "../utils.js";

import multer from "multer";
import { getObjectSignedUrl, uploadFile } from "../s3.js";
import { Card } from "../models/card.js";

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

userRouter.get("/emails", async (req, res, next) => {
    console.log("Req.query.email", req.query.email);
    if(req.query.email) {
        let user = await User.findOne({"login.email": req.query.email});
        res.status(200).send({emailAvailable: !user});
    } else {
        res.status(400).send("No email submitted");
    }
});

userRouter.get("/:userId/identification", async (req, res, next) => {
    let partialData = {
        firstName: req.user.name.first,
        lastName: req.user.name.last,
        username: req.user.login.username,
        photo: await getObjectSignedUrl(req.user.photo)
    }
    res.status(200).send(partialData);
});

userRouter.get("/:userId/tile", async (req, res, next) => {
    let partialData = {
        firstName: req.user.name.first,
        lastName: req.user.name.last,
        login: req.user.login,
        // password: req.user.login.password, /////////////////////////delete this once testing is done
        email: req.user.email,
        photo: await getObjectSignedUrl(req.user.photo),
    }
    res.status(200).send(partialData);
});

userRouter.get("/:userId", async (req, res, next) => {
    try {
        let userData = await User.findById(req.user._id)
            .populate("decks", "name")
            .populate("messages.received", "read")
            .populate("messages.sent", "read")
            .populate("notifications", "read");
        userData.photo = await getObjectSignedUrl(req.user.photo);
        res.status(200).send(userData);          
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
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

userRouter.patch("/:userId/verification", async (req, res, next) => {
    if(Date.now() < req.user.verification.codeExpDate) {
        if(req.user.verification.code === req.body.code) {
            await User.findByIdAndUpdate(req.user._id, {"verification.verified": true});
            res.status(200).send({verificationResponse: "verified"});
        } else {
            res.status(401).send({verificationResponse: "invalid"})
        }
    } else {
        res.status(401).send({verificationResponse: "expired"});
    }
});

userRouter.delete("/:userId", async (req, res, next) => {
    const userId = req.user._id
    try {
        await Group.updateMany({members: userId}, {$pull: {members: userId}});
        await Group.updateMany({administrators: userId}, {$pull: {administrators: userId}});
        await Deck.deleteMany({creator: userId});
        await Deck.updateMany({"permissions.view": userId}, {$pull: {"permissions.view": userId}});
        const deletedUser = await User.findByIdAndDelete(userId);
        await DeckAttempt.deleteMany({_id: {$in: deletedUser.deckAttempts}});
        res.status(200).send(userId);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
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

//possibly rename route so it's clear that the name of the decks is being sent back too, that it's really an array of decks of cards rather than an array of cards
userRouter.get("/:userId/cards", async (req, res, next) => {
    try {
        const populatedUser = await req.user.populate("decks", "name cards -_id");
        res.status(200).send(populatedUser.decks);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

userRouter.post("/:userId/decks", async (req, res, next) => {
    try {
        let newDeck = new Deck({
            name: req.body.deckName,
            publiclyAvailable: req.body.publiclyAvailable,
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

userRouter.post("/:userId/messages", async (req, res, next) => {
    let newMessage;
    try {
        switch(req.body.messageType) {
            case "DeckSubmission":
                newMessage = new DeckSubmission({
                    sendingUser: req.body.sendingUser,
                    targetDeck: req.body.targetDeck,
                    targetGroup: req.body.targetGroup
                });
                break;
            case "DeckDecision":
                newMessage = new DeckDecision({
                    acceptanceStatus: req.body.acceptanceStatus,
                    comment: req.body.comment,
                    targetDeck: req.body.targetDeck,
                    targetGroup: req.body.targetGroup,
                    read: [],
                    sendingUser: req.body.sendingUser
                });
                break;
        }
        const savedMessage = await newMessage.save();

        await User.findByIdAndUpdate(req.user._id, {$push: {'messages.received': savedMessage}});
        await User.findByIdAndUpdate(savedMessage.sendingUser, {$push: {'messages.sent': savedMessage}});
        res.status(200).send(savedMessage);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
// userRouter.post("/:userId/messages", async (req, res, next) => {
//     try {
//         let newMessage = new Message();
//         newMessage.type = req.body.type;
//         newMessage.sendingUser = req.body.sendingUser;
//         newMessage.targetDeck = req.body.targetDeck;
//         newMessage.targetGroup = req.body.targetGroup;
//         const message = await newMessage.save();
//         await User.findByIdAndUpdate(req.user._id, {$push: {'messages.received': message}});
//         await User.findByIdAndUpdate(message.sendingUser, {$push: {'messages.sent': message}});
//         res.status(200).send(message);
//     } catch (err) {
//         res.status(500).send("There was an error with your request");
//         throw receivingUserErr;
//     }
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

userRouter.post("/:userId/notifications", async (req, res, next) => {
    try {
        let newNotification;
        switch(req.body.notificationType) {
            case CardDecision: 
                newNotification = CardDecision(req.body);
                break;
            case "JoinDecision":
                newNotification = JoinDecision(req.body);
                break;
            default: 
                res.status(400).send("Invalid notification type");
                break;
        }
        const savedNotification = await newNotification.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {notifications: savedNotification}});
        res.status(200).send(savedNotification);
    } catch (err) {
        res.status(500).send(err.message);
        throw err;
    }
});

userRouter.patch("/:userId/notifications/mark-as-read", async (req, res, next) => {
    try {
        await Notification.updateMany({_id: {$in: req.user.notifications}}, {$set: {read: true}});
        let user = await User.findById(req.user._id, "notifications")
            .populate({
                path: "notifications",
                select: "read -notificationType"
            })
        res.status(200).send(user.notifications);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

userRouter.post("/:userId/groups", async (req, res, next) => {
    console.log("body:", req.body);
    try {
        let newGroup = new Group(req.body);
        await newGroup.save();
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {$push: {groups: newGroup._id, adminOf: newGroup._id}});
        res.status(200).send(newGroup._id);
    } catch (err) {
        res.status(500).send(err.message);
        console.error(err);
    }
});

userRouter.put("/:userId/notifications", (req, res, next) => {
    Notification.updateMany({_id: {$in: req.user.notifications}}, {$set: {read: true}})
        //may not need to send anything back here, may need to send back certain number of notifications
        .then(res.status(200).send())
        .catch(err => {
            res.status(500).send("There was an error with your request");
            throw err;
        });
});

const fileFilter = (req, file, callback) => {
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        callback(null, true);
    } else {
        callback(new Error("Only jpeg and png file types may be submitted"), false);
    }
};

//figure out how to handle errors for fileSize, etc
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

userRouter.patch("/:userId", upload.single("photo"), async (req, res, next) => {
    const patchObj = {};
    
    if(req.file) {
        const file = req.file;
        let photoName;
        if(req.user.photo) {
            photoName = req.user.photo;
        } else {
            photoName = generateRandomFileName();
            patchObj.photo = photoName;
        }
        await uploadFile(file.buffer, photoName, file.mimetype)
    }
    
    if(req.body.first || req.body.last) {
        patchObj.name = {
            first: req.body.first ? req.body.first : req.user.name.first ? req.user.name.first : "",
            last: req.body.last ? req.body.last : req.user.name.last ? req.user.name.last : "",
        }
    }
    
    if((req.body.username || req.body.password) || req.body.email) {
        if(req.body.email) {
            console.log("nothing counts as something")
        }
        patchObj.login = {
            username: req.body.username ? req.body.username : req.user.login.username ? req.user.login.username : "",
            password: req.body.password ? req.body.password : req.user.login.password ? req.user.login.password : "",
            email: req.body.email ? req.body.email : req.user.login.email ? req.user.login.email : ""
        }
    }

    console.log({patchObj});
    try {
        const user = await User.findByIdAndUpdate(req.user._id, patchObj, {new: true});
        let responseData = user;
        // why doesn't this delete the password
        // delete responseData.login.password;

        responseData.login = {username: user.login.username};
        let photoUrl = await getObjectSignedUrl(user.photo);
        responseData.photo = photoUrl;
        res.status(200).send(responseData);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw(err);
    }
});

userRouter.post("/:userId/attempts", async (req, res, next) => {
    try {
        const cardAttempts = [];
        for(let i = 0; i < req.body.cardAttempts?.length; i++) {
            const attemptData = req.body.cardAttempts[i];

            const newCardAttempt = new CardAttempt({
                datePracticed: attemptData.datePracticed,
                cardType: attemptData.cardType,
                question: attemptData.question,
                correctAnswer: attemptData.correctAnswer,
                answeredCorrectly: attemptData.answeredCorrectly,
                wrongAnswerSelected: attemptData.wrongAnswerSelected
            });
            const savedCardAttempt = await newCardAttempt.save();

            await Card.findByIdAndUpdate(attemptData.cardId, {$push: {attempts: savedCardAttempt}});
            cardAttempts.push(savedCardAttempt._id);
        }
        console.log({cardAttempts});
        const newDeckAttempt = new DeckAttempt({
            deck: req.body.deck,
            datePracticed: req.body.datePracticed,
            accuracyRate: req.body.accuracyRate,
            cards: cardAttempts
        });
        const savedDeckAttempt = await newDeckAttempt.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {deckAttempts: savedDeckAttempt}});
        await Deck.findByIdAndUpdate(req.body.deck, {$push: {attempts: savedDeckAttempt}});
        res.status(200).send(savedDeckAttempt);
    } catch (err) {
        res.status(500).send(err.message);
        throw err;
    }
});

userRouter.delete("/:userId/attempts/:attemptId", async (req, res, next) => {
    const attemptId = req.params.attemptId;
    try {
        await User.findByIdAndUpdate(req.user._id, {$pull: {deckAttempts: attemptId}});
        await DeckAttempt.findByIdAndDelete(attemptId);
        res.status(200).send(attemptId);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

userRouter.delete("/:userId/attempts", async (req, res, next) => {
    try {
        const deletedAttempts = await DeckAttempt.deleteMany({_id: req.user.deckAttempts});
        await User.findByIdAndUpdate(req.user._id, {$set: {deckAttempts: []}});
        res.status(200).send(deletedAttempts.deletedCount);
    } catch (err) {
        res.status(500).send("There was an error with your request");
    }
});

userRouter.delete("/:userId/decks/:deckId/attempts", async (req, res, next) => {
    try {
        const deckAttempts = await DeckAttempt.find({$and: [{_id: {$in: req.user.deckAttempts}}, {deck: req.params.deckId}]});
        let deckAttemptIds = deckAttempts.map(attempt => attempt._id);
        await User.findByIdAndUpdate(req.user._id, {$pull: {deckAttempts: {$in: deckAttemptIds}}});
        const deletedAttempts = await DeckAttempt.deleteMany({_id: {$in: deckAttemptIds}});
        res.status(200).send(deletedAttempts.deletedCount);
    } catch (err) {
        res.status(500).send("There was an error with your request");
    }
});

userRouter.get("/:userId/attempts", (req, res, next) => {
    res.status(200).send(req.user.deckAttempts);
});

export default userRouter;