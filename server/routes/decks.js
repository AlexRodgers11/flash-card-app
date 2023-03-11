import express from "express";
const deckRouter = express.Router();
import mongoose from "mongoose";

import DeckAttempt from "../models/deckAttempt.js";
import { Card, FlashCard, MultipleChoiceCard, TrueFalseCard } from "../models/card.js";
import Deck from "../models/deck.js";
import Group from "../models/group.js";
import Category from "../models/category.js";
import User from "../models/user.js";
import { extendedRateLimiter, getUserIdFromJWTToken } from "../utils.js";

deckRouter.param("deckId", (req, res, next, deckId) => {
    Deck.findById(deckId, (err, deck) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else if(!deck) {
            res.status(404).send("Deck not found");
            throw err;
        } else {
            req.deck = deck;
            next();
        }
    });
});

deckRouter.get("/", async (req, res, next) => {
    console.log({query: req.query});
    try {
        const page = req.query.page || 1;
        const limit = 25;
        if(req.query.categoryId) {
            console.log("There is a category Id")
            
            let categoryId = mongoose.Types.ObjectId(req.query.categoryId);
            if(req.query.searchString) {
                console.log("There is a category and search string");
                let regExp = new RegExp(req.query.searchString, "i");
                const decks = await Deck.find({$and: [{publiclyAvailable: true}, {name: {$regex: regExp}}, {categories: {$in: [categoryId]}}]}, "_id name publiclyAvailable cards createdAt").skip(((page - 1) * limit)).limit(limit);
                res.status(200).send(decks.map(deck => {
                    return {cardCount: deck.cards.length, dateCreated: deck.createdAt, deckId: deck._id, deckName: deck.name}
                }));
            } else {
                console.log("There is only a category");
                const decks = await Deck.find({$and: [{publiclyAvailable: true}, {categories: {$in: [categoryId]}}]}, "_id name publiclyAvailable cards createdAt").skip(((page - 1) * limit)).limit(limit);
                res.status(200).send(decks.map(deck => {
                    return {cardCount: deck.cards.length, dateCreated: deck.createdAt, deckId: deck._id, deckName: deck.name}
                }));
            }
        } else {
            console.log("only search");
            
            let regExp = new RegExp(req.query.searchString, "i");            
            const decks = await Deck.find({$and: [{publiclyAvailable: true}, {name: {$regex: regExp}}]}, "_id name publiclyAvailable cards createdAt").skip(((page - 1) * limit)).limit(limit);
            res.status(200).send(decks.map(deck => {
                return {cardCount: deck.cards.length, dateCreated: deck.createdAt, deckId: deck._id, deckName: deck.name}
            }));
        }
    } catch (err) {
        res.status(500).send("There was an error with your request");
        console.error(err.message || "There was an error with your request");
    }   
});

deckRouter.post("/", (req, res, next) => {
    let newDeck = new Deck(req.body);
    newDeck.save((err, deck) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(deck);
        }
    });
});

deckRouter.get("/:deckId/tile", extendedRateLimiter, (req, res, next) => {
    let response = {
        name: req.deck.name,
        publiclyAvailable: req.deck.publiclyAvailable,
        createdAt: req.deck.createdAt,
        cardCount: req.deck.cards.length,
        permissions: req.deck.permissions
    };
    res.status(200).send(JSON.stringify(response));
});

deckRouter.get("/:deckId/tile-stats", async (req, res, next) => {
    console.log({deck: req.deck});
    try {
        let populatedDeck = await req.deck.populate("attempts", "datePracticed accuracyRate");
                
        let responseObj = {
            deckName: req.deck.name,
            dateLastPracticed: populatedDeck.attempts[0]?.datePracticed || undefined,
            timesPracticed: populatedDeck.attempts.length,
            accuracyRate: populatedDeck.attempts.length > 0 ? Math.round(populatedDeck.attempts.reduce((acc, curr) => acc + curr.accuracyRate, 0) / populatedDeck.attempts.length) : undefined,
            cardCount: req.deck.cards.length
        };
        res.status(200).send(responseObj);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

deckRouter.get("/:deckId/practice", (req, res, next) => {
    Deck.findById(req.deck._id)
            .populate({
                path: "cards"
            })
            .catch(err => {
                throw err;
            })
            .then(deck => res.status(200).send(deck));
});

deckRouter.get("/:deckId", (req, res, next) => {
    res.status(200).send(req.deck);
});

deckRouter.delete("/:deckId", async (req, res, next) => {
    try {
        await Group.updateMany({decks: req.deck._id}, {$pull: {decks: req.deck._id}});
        await Category.updateMany({decks: req.deck._id}, {$pull: {decks: req.deck._id}});
        await User.findByIdAndUpdate(req.deck.creator, {$pull: {decks: req.deck._id}});
        await DeckAttempt.deleteMany({deck: req.deck._id});
        const deck = await Deck.findByIdAndDelete(req.deck._id);
        await Card.deleteMany({_id: {$in: req.deck.cards}});
        res.status(200).send(deck._id);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    } 
});

// deckRouter.delete("/:deckId", async (req, res, next) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         await Group.updateMany({decks: req.deck._id}, {$pull: {decks: req.deck._id}}, {session: session});
//         await Category.updateMany({decks: req.deck._id}, {$pull: {decks: req.deck._id}}, {session: session});
//         await User.findByIdAndUpdate(req.deck.creator, {$pull: {decks: req.deck._id}}, {session: session});
//         await Attempt.deleteMany({deck: req.deck._id}, {session: session});
//         await Deck.findByIdAndDelete(req.deck._id, {session: session});//make sure middle arg not necessary
//         await Card.deleteMany({_id: {$in: req.deck.cards}}, {session: session});
//         await session.commitTransaction();
//         res.status(200).send(req.deck._id);
//     } catch (err) {
//         await session.abortTransaction();
//         res.status(500).send("There was an error with your request");
//         throw err;
//     } finally {
//         session.endSession();
//     }
// });


deckRouter.patch("/:deckId", (req, res, next) => {
    Deck.findByIdAndUpdate(req.deck._id, req.body, {new: true}, (err, deck) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(deck);
        }
    });
});

deckRouter.post("/:deckId/cards", getUserIdFromJWTToken, async (req, res, next) => {
    if(req.deck.groupDeckBelongsTo) {
        const foundGroup = await Group.findById(req.deck.groupDeckBelongsTo, "administrators");
        if(!foundGroup.administrators.map(admin => admin.toString()).includes(req.userId)) {
            res.status(403).send("Only this deck's group administrators can add cards to it");
            return;
        }
    } else if(req.userId !== req.deck.creator.toString()) {
        res.status(403).send("Only this deck's creator can add a card to it");
        return;
    }
    let cardType = req.body.cardType;
    delete req.body.cardType;
    let newCard;
    switch(cardType) {
        case "FlashCard":
            newCard = new FlashCard({...req.body, creator: req.userId, ...(req.deck.groupDeckBelongsTo && {groupCardBelongsTo: req.deck.groupDeckBelongsTo}), _id: new mongoose.Types.ObjectId()});
            break;
        case "TrueFalseCard":
            newCard = new TrueFalseCard({...req.body, creator: req.userId, ...(req.deck.groupDeckBelongsTo && {groupCardBelongsTo: req.deck.groupDeckBelongsTo}), _id: new mongoose.Types.ObjectId()});
            break;
        case "MultipleChoiceCard":
            newCard = new MultipleChoiceCard({...req.body, creator: req.userId, ...(req.deck.groupDeckBelongsTo && {groupCardBelongsTo: req.deck.groupDeckBelongsTo}), _id: new mongoose.Types.ObjectId()});
            break;
        default:
            res.status(500).send("Invalid card type selected");
            return;
    }
    try {
        const card = await newCard.save();
        await Deck.findByIdAndUpdate(req.deck._id, {$push: {cards: card}});
        res.status(200).send(card._id);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

deckRouter.get("/:deckId/attempts", getUserIdFromJWTToken, async (req, res, next) => {
    if(req.userId !== req.deck.creator.toString()) {
        return res.status(401).send("Only the user who made these attempts may access their data");
    }

    const populatedDeck = await req.deck.populate({
        path: "attempts",
        select: "datePracticed accuracyRate",
        populate: {
            path: "deck",
            select: "name"
        }
    });
    res.status(200).send(populatedDeck.attempts);
});

export default deckRouter;