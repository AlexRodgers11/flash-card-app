import express from "express";
const userRouter = express.Router();
import jwt from "jwt-simple";

import CardAttempt from "../models/cardAttempt.js";
import User from "../models/user.js";
import Group from "../models/group.js";
import Deck from "../models/deck.js";
import DeckAttempt from "../models/deckAttempt.js";
import { DeckDecision, DeckSubmission, Message } from "../models/message.js";
// import { CardDecision, DeckDecision, JoinDecision, Notification } from '../models/notification.js';
// import { CardDecision, JoinDecision, Notification } from '../models/notification.js';
import { Notification } from '../models/notification.js';
import { extendedRateLimiter, generateRandomFileName, getUserIdFromJWTToken } from "../utils.js";

import multer from "multer";
import { deleteFile, getObjectSignedUrl, uploadFile } from "../s3.js";
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
    if(req.query.email) {
        let user = await User.findOne({"login.email": req.query.email});
        res.status(200).send({emailAvailable: !user});
    } else {
        res.status(400).send("No email submitted");
    }
});

userRouter.get("/usernames", async (req, res, next) => {
    if(req.query.username) {
        let user = await User.findOne({"login.username": req.query.username});
        res.status(200).send({usernameAvailable: !user});
    } else {
        res.status(400).send("No email submitted");
    }
});

userRouter.get("/:userId/identification", async (req, res, next) => {
    let partialData = {
        firstName: req.user.name.first,
        lastName: req.user.name.last,
        username: req.user.login.username,
        photo: req.user.photo ? !req.user.photo.includes(".") ? await getObjectSignedUrl(req.user.photo) : req.user.photo : "",
    }
    res.status(200).send(partialData);
});

userRouter.get("/:userId/tile", extendedRateLimiter, async (req, res, next) => {
    let partialData = {
        firstName: req.user.name.first,
        lastName: req.user.name.last,
        login: req.user.login,
        // password: req.user.login.password, /////////////////////////delete this once testing is done
        email: req.user.email,
        photo: req.user.photo ? !req.user.photo.includes(".") ? await getObjectSignedUrl(req.user.photo) : req.user.photo : "",
    }
    res.status(200).send(partialData);
});

userRouter.get("/:userId", async (req, res, next) => {
    try {
        let userData = await User.findById(req.user._id)
            .populate("decks", "name")
        userData.photo = req.user.photo ? !req.user.photo.includes(".") ? await getObjectSignedUrl(req.user.photo) : req.user.photo : "",
        
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
    try {
        if(Date.now() < req.user.verification.codeExpDate) {
            if(req.user.verification.code === req.body.code) {
                await User.findByIdAndUpdate(req.user._id, {"verification.verified": true});
                const updatedUser = await User.findByIdAndUpdate(req.user._id, { accountSetupStage: "verified"}, {new: true});
                // res.status(200).send({verificationResponse: "verified"});
                res.status(200).send({accountSetupStage: updatedUser.accountSetupStage});
            } else {
                res.status(401).send({verificationResponse: "invalid"})
            }
        } else {
            res.status(401).send({verificationResponse: "expired"});
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

userRouter.delete("/:userId", async (req, res, next) => {
    const userId = req.user._id
    try {
        //delete all cards and decks of all groups the user is head admin of, then delete the group itself
        for(let i = 0; i < req.user.groups.length; i++) {
            let group = await Group.findById(req.user.groups[i]);
        
            if(group.administrators[0] .equals(userId)) {
                console.log("deleting cards");
                await Card.deleteMany({groupCardBelongsTo: group._id});
                console.log("deleting deck");
                await Deck.deleteMany({groupDeckBelongsTo: group._id});
                console.log("deleting group");
                await Group.findByIdAndDelete(group._id);
            }
        }
        
        //for any remaining groups remove the user from the members array
        await Group.updateMany({_id: {$in: req.user.groups}}, {$pull: {members: userId}});
        

        //for any remaining groups remove the user from the members array
        await Group.updateMany({_id: {$in: req.user.adminOf}}, {$pull: {administrators: userId}});

        //delete all of the user's decks and the cards inside them
        for (let i = 0; i < req.user.decks.length; i++) {
            let deck = await Deck.findById(req.user.decks[i]);
            await Card.deleteMany({_id: {$in: deck.cards}});
        }

        await Deck.deleteMany({_id: {$in: req.user.decks}});
        
        //delete the user
        const deletedUser = await User.findByIdAndDelete(userId);
        
        //delete the user's deck attempts
        await DeckAttempt.deleteMany({_id: {$in: deletedUser.deckAttempts}});
        
        //add something here to remove the deck from any categories it is associated with. Be sure to do this in groups when deleting groups as well, and in deckRouter when deleting decks

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

userRouter.get("/:userId/decks", getUserIdFromJWTToken, async (req, res, next) => {
    if(req.userId !== req.user._id.toString()) {
        const populatedUser = await req.user.populate("decks", "publiclyAvailable");
        const publicDecks = populatedUser.decks.filter(deck => deck.publiclyAvailable).map(deck => deck._id);
        res.status(200).send(publicDecks);
    } else {
        res.status(200).send(req.user.decks);
    }
});


userRouter.get("/:userId/card-stats", getUserIdFromJWTToken, async (req, res, next) => {
    if(req.userId !== req.user._id.toString()) {
        res.status(403).send("Only the user who attempted these cards may retrieve their stats");
        return;
    }
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
            //this needs to be a message
            // case "JoinDecision":
            //     newNotification = JoinDecision(req.body);
            //     break;
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

userRouter.post("/:userId/groups", async (req, res, next) => {
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

userRouter.patch("/:userId", getUserIdFromJWTToken, upload.single("photo"), async (req, res, next) => {
    if(req.userId !== req.user._id.toString()) {
        return res.status(403).send("Users can only update their own information");
    }
    const patchObj = {};
    
    if(req.file) {
        const file = req.file;
        let photoName;
        photoName = generateRandomFileName();
        patchObj.photo = photoName;
        
        await uploadFile(file.buffer, photoName, file.mimetype);
        if(req.user.photo) {
            await deleteFile(req.user.photo);
        }
    }
    
    if(req.body.name) {
        patchObj.name = req.body.name;
    }
    
    if(req.body.login) {
        patchObj.login = {
            username: req.body.login.username ? req.body.login.username : req.user.login.username ? req.user.login.username : "",
            password: req.body.login.password ? req.body.login.password : req.user.login.password ? req.user.login.password : "",
            email: req.body.login.email ? req.body.login.email : req.user.login.email ? req.user.login.email : ""
        }
    }
    console.log({patchObj});
    try {
        let user;
        user = await User.findByIdAndUpdate(req.user._id, patchObj, {new: true});

        if(user.accountSetupStage !== "complete" && ((user._id && user.name.first) && (user.name.last && user.login.email))) {
            user = await User.findByIdAndUpdate(req.user._id, {accountSetupStage: "complete"}, {new: true});
        }

        let responseData = {};
        
        for(const key in req.body) {
            responseData[key] = user[key];
        }

        responseData.accountSetupStage = user.accountSetupStage;

        if(responseData.login?.password) {
            let passwordlessLogin = {
                username: responseData.login.username,
                email: responseData.login.email
            }
            responseData.login = passwordlessLogin;
        }

        if(req.file) {
            let photoUrl = await getObjectSignedUrl(user.photo);
            responseData.photo = photoUrl;
        }
        console.log({responseData});
        res.status(200).send(responseData);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw(err);
    }
});

userRouter.post("/:userId/attempts", getUserIdFromJWTToken, async (req, res, next) => {
    if(req.userId !== req.user._id.toString()) {
        console.log({1: req.userId});
        console.log({2: req.user._id});
        console.log({3: typeof req.userId});
        console.log({4: typeof req.user._id});
        return res.status(401).send("Unauthorized. A user may only add an attempt to their own statistics");
    }
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
            cards: cardAttempts,
            attempter: req.user._id
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

userRouter.get("/:userId/attempts", getUserIdFromJWTToken, async (req, res, next) => {
    if(req.userId !== req.user._id.toString()) {
        return res.status(401).send("Only the user who made these attempts may access their data");
    }

    const populatedUser = await req.user.populate({
        path: "deckAttempts",
        select: "datePracticed accuracyRate",
        populate: {
            path: "deck",
            select: "name"
        }
    });
    console.log({attempts: populatedUser.deckAttempts});
    res.status(200).send(populatedUser.deckAttempts);
});

export default userRouter;