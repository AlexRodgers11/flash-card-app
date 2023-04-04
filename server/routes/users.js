import express from "express";
const userRouter = express.Router();

import CardAttempt from "../models/cardAttempt.js";
import User from "../models/user.js";
import Group from "../models/group.js";
import Deck from "../models/deck.js";
import DeckAttempt from "../models/deckAttempt.js";
import { copyDeck, generateRandomFileName, getUserIdFromJWTToken, storage, upload, fileFilter } from "../utils.js";
import jwt from "jwt-simple";
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

userRouter.param("protectedUserId", async (req, res, next, protectedUserId) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized: No token provided'
            });
        }

        const decoded = jwt.decode(token.slice(7), process.env.TOKEN_KEY);
        req.userId = decoded.sub;

        const user = await User.findById(protectedUserId);

        if (user._id.toString() !== req.userId.toString()) {
            res.status(403).send("Unauthorized");
        } else {
            req.user = user;
            next();
        }
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
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

userRouter.get("/:userId", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        if(req.query.public_info === "true") {
            const user = await User.findById(req.user._id, "login.username login.email name.first name.last photo")
            user.photo = user.photo ? !user.photo.includes(".") ? await getObjectSignedUrl(user.photo) : user.photo : "",
            res.status(200).send(user);
        } else {
            if(req.userId !== req.user._id.toString()) {
                return res.status(401).send("Unauthorized");
            }
            let populatedUser = await User.findById(req.user._id, "-login.password -verification")
                .populate("decks", "name");
            populatedUser.photo = req.user.photo ? !req.user.photo.includes(".") ? await getObjectSignedUrl(req.user.photo) : req.user.photo : "",
            res.status(200).send(populatedUser);          
        }
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

userRouter.patch("/:protectedUserId/verification", async (req, res, next) => {
    try {
        if(Date.now() < req.user.verification.codeExpDate) {
            if(req.user.verification.code === req.body.code) {
                await User.findByIdAndUpdate(req.user._id, {"verification.verified": true});
                const updatedUser = await User.findByIdAndUpdate(req.user._id, { accountSetupStage: "verified"}, {new: true});
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

userRouter.delete("/:protectedUserId", async (req, res, next) => {
    const userId = req.user._id
    try {
        //delete all cards and decks of all groups the user is head admin of, then delete the group itself
        for(let i = 0; i < req.user.groups.length; i++) {
            let group = await Group.findById(req.user.groups[i]);
        
            if(group.administrators[0] .equals(userId)) {
                await Card.deleteMany({groupCardBelongsTo: group._id});
                await Deck.deleteMany({groupDeckBelongsTo: group._id});
                await Group.findByIdAndDelete(group._id);
            }
        }
        
        //for any remaining groups remove the user from the members array
        await Group.updateMany({_id: {$in: req.user.groups}}, {$pull: {members: userId}});
        

        //for any remaining groups remove the user from the members array
        await Group.updateMany({_id: {$in: req.user.adminOf}}, {$pull: {administrators: userId}});

        //delete all of the user's decks and the cards inside them
        for (let i = 0; i < req.user.decks.length; i++) {
            const deck = await Deck.findById(req.user.decks[i]);
            await Card.deleteMany({_id: {$in: deck.cards}});
        }

        await Deck.deleteMany({_id: {$in: req.user.decks}});
        
        //delete the user's card attempts
        for(let i = 0; i < req.user.deckAttempts.length; i++) {
            await CardAttempt.deleteMany({fullDeckAttempt: {$in: req.user.deckAttempts}, groupAttemptBelongsTo: ""});
        }
        //delete the user's deck attempts
        await DeckAttempt.deleteMany({_id: {$in: req.user.deckAttempts}, groupAttemptBelongsTo: ""});
        
        //delete the user
        const deletedUser = await User.findByIdAndDelete(userId);
        
        //add something here to remove the deck from any categories it is associated with. Be sure to do this in groups when deleting groups as well, and in deckRouter when deleting decks

        res.status(200).send(userId);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

userRouter.get("/:protectedUserId/card-stats", async (req, res, next) => {
    try {
        const populatedUser = await req.user.populate(
            [
                {
                    path: "decks",
                    select: "name cards",
                    populate: {
                        path: "cards",
                        select: "question attempts",
                        populate: {
                            path: "attempts",
                            select: "createdAt answeredCorrectly"
                        }
                    }
                }
            ]
        );
        const responseObj = populatedUser.decks.map(deck => {
            return {
                _id: deck._id,
                name: deck.name,
                cards: deck.cards.map(card => {
                    return {
                        _id: card._id,
                        cardQuestion: card.question,
                        dateLastPracticed: card.attempts[0]?.createdAt,
                        attemptCount: card.attempts.length,
                        accuracyRate: card.attempts.length > 0 ? Math.round(card.attempts.reduce((acc, curr) => acc + (curr.answeredCorrectly ? 1 : 0), 0) * 100 / card.attempts.length) : undefined,
                    }

                })
            }
        })

        res.status(200).send(responseObj);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

userRouter.post("/:protectedUserId/decks", async (req, res, next) => {
    try {
        let newDeck = new Deck({
            name: req.body.deckName,
            publiclyAvailable: req.body.publiclyAvailable || false,
            creator: req.body.creator,
            allowCopies: req.body.allowCopies || false
        });
        const deck = await newDeck.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {decks: deck}});
        res.status(200).send({_id: deck._id, name: deck.name});
    } catch (err) {
        res.status(500).send(err.message);
        throw err;
    }
});

userRouter.post("/:protectedUserId/decks/copy/:deckId", async (req, res, next) => {
    try {
        let newDeck = await copyDeck(req.params.deckId, req.userId);
        newDeck.copiedFrom = req.params.deckId;
        const savedDeckCopy = await newDeck.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {decks: savedDeckCopy}});
        res.status(200).send({_id: savedDeckCopy._id, name: savedDeckCopy.name});
    } catch (err) {
        res.status(500).send(err.message);
    }
});

userRouter.post("/:protectedUserId/groups", async (req, res, next) => {
    try {
        let newGroup = new Group(req.body);
        await newGroup.save();
        await User.findByIdAndUpdate(req.user._id, {$push: {groups: newGroup._id, adminOf: newGroup._id}});
        res.status(200).send(newGroup._id);
    } catch (err) {
        res.status(500).send(err.message);
        console.error(err);
    }
});

userRouter.patch("/:protectedUserId", upload.single("photo"), async (req, res, next) => {
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
    if(req.body.statisticsTracking) {
        patchObj.statisticsTracking = req.body.statisticsTracking;
    }

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
        res.status(200).send(responseData);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw(err);
    }
});

userRouter.post("/:protectedUserId/attempts", async (req, res, next) => {
    try {
        const practicedDeck = await Deck.findById(req.body.deck);
        const newDeckAttempt = new DeckAttempt({
            deck: req.body.deck,
            datePracticed: req.body.datePracticed,
            accuracyRate: req.body.accuracyRate,
            attempter: req.user._id,
            groupAttemptBelongsTo: practicedDeck.groupDeckBelongsTo || undefined
        });
        const savedDeckAttempt = await newDeckAttempt.save();
        const cardAttempts = [];
        for(let i = 0; i < req.body.cardAttempts?.length; i++) {
            const attemptData = req.body.cardAttempts[i];

            const newCardAttempt = new CardAttempt({
                cardId: attemptData.cardId,
                datePracticed: attemptData.datePracticed,
                cardType: attemptData.cardType,
                question: attemptData.question,
                correctAnswer: attemptData.correctAnswer,
                answeredCorrectly: attemptData.answeredCorrectly,
                wrongAnswerSelected: attemptData.wrongAnswerSelected,
                fullDeckAttempt: savedDeckAttempt._id,
                groupAttemptBelongsTo: practicedDeck.groupDeckBelongsTo || undefined
            });
            const savedCardAttempt = await newCardAttempt.save();

            await Card.findByIdAndUpdate(attemptData.cardId, {$push: {attempts: savedCardAttempt}});
            cardAttempts.push(savedCardAttempt._id);
        }
        const finishedDeckAttempt = await DeckAttempt.findByIdAndUpdate(savedDeckAttempt._id,{$set: {cards: cardAttempts}});
        await User.findByIdAndUpdate(req.user._id, {$push: {deckAttempts: finishedDeckAttempt}});
        await Deck.findByIdAndUpdate(req.body.deck, {$push: {attempts: finishedDeckAttempt}});
        res.status(200).send(savedDeckAttempt);
    } catch (err) {
        res.status(500).send(err.message);
        throw err;
    }
});

userRouter.delete("/:protectedUserId/decks/:deckId/attempts", async (req, res, next) => {
    //need to add logic to remove related card attempts
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

userRouter.get("/:protectedUserId/attempts", async (req, res, next) => {
    const populatedUser = await req.user.populate({
        path: "deckAttempts",
        select: "datePracticed accuracyRate",
        populate: {
            path: "deck",
            select: "name"
        }
    });
    res.status(200).send(populatedUser.deckAttempts);
});

userRouter.get("/:protectedUserId/decks/statistics", async (req, res, next) => {
    try {
        const populatedUser = await req.user.populate({
            path: "decks",
            select: "name",
            populate: {
                path: "attempts",
                select: "datePracticed accuracyRate"
            }
        });
        
        const responseArr = populatedUser.decks.map(deck => {
            return {
                name: deck.name,
                _id: deck._id,
                dateLastPracticed: deck.attempts[0]?.datePracticed || undefined,
                accuracyRate: deck.attempts.length > 0 ? Math.round(deck.attempts.reduce((acc, curr) => acc + curr.accuracyRate, 0) / deck.attempts.length) : undefined,
            }
        });
        res.status(200).send(responseArr);
    } catch (err) {
        res.status(500).send(err.message);
    }
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

export default userRouter;