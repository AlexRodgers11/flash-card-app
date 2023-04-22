import express from "express";
const deckRouter = express.Router();
import mongoose from "mongoose";

import CardAttempt from "../models/cardAttempt.js";
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
    try {
        const page = req.query.page || 1;
        const limit = 25;
        if(req.query.categoryId) {
            let categoryId = mongoose.Types.ObjectId(req.query.categoryId);
            if(req.query.searchString) {
                let regExp = new RegExp(req.query.searchString, "i");
                const decks = await Deck.find({$and: [{publiclyAvailable: true}, {name: {$regex: regExp}}, {categories: {$in: [categoryId]}}]}, "_id name publiclyAvailable cards createdAt").skip(((page - 1) * limit)).limit(limit);
                res.status(200).send(decks.map(deck => {
                    return {cardCount: deck.cards.length, dateCreated: deck.createdAt, deckId: deck._id, deckName: deck.name}
                }));
            } else {
                const decks = await Deck.find({$and: [{publiclyAvailable: true}, {categories: {$in: [categoryId]}}]}, "_id name publiclyAvailable cards createdAt").skip(((page - 1) * limit)).limit(limit);
                res.status(200).send(decks.map(deck => {
                    return {cardCount: deck.cards.length, dateCreated: deck.createdAt, deckId: deck._id, deckName: deck.name}
                }));
            }
        } else {
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

deckRouter.get("/:deckId/tile", getUserIdFromJWTToken, extendedRateLimiter, async (req, res, next) => {
    try {
        if(req.deck.creator.toString() !== req.userId.toString() && !req.deck.publiclyAvailable) {
            const user = await User.findById(req.userId, "groups");
            if(!req.deck.groupDeckBelongsTo || !user.groups.some(group => group._id.toString() === req.deck.groupDeckBelongsTo.toString())) {
                return res.status(401).send("You are not authorized to view this deck");
            }
        }

        let response = {
            name: req.deck.name,
            publiclyAvailable: req.deck.publiclyAvailable,
            allowCopies: req.deck.allowCopies || false,
            createdAt: req.deck.createdAt,
            cardCount: req.deck.cards.length,
            permissions: req.deck.permissions,
            ...(!req.deck.groupDeckBelongsTo && {creator: req.deck.creator}),
            ...(req.deck.groupDeckBelongsTo && {groupDeckBelongsTo: req.deck.groupDeckBelongsTo}),
        };
        res.status(200).send(JSON.stringify(response));

    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
    
});

deckRouter.get("/:deckId/practice", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        if(req.deck.creator.toString() !== req.userId.toString() && !req.deck.publiclyAvailable) {
            const user = await User.findById(req.userId, "groups");
            if(!req.deck.groupDeckBelongsTo || !user.groups.some(group => group._id.toString() === req.deck.groupDeckBelongsTo.toString())) {
                return res.status(401).send("You are not authorized to view this deck");
            }
        } else if(req.deck.cards.length < 1) {
            return res.status(400).send("This deck doesn't have any cards to practice");
        }
        const deck = await Deck.findById(req.deck._id, "cards")
            .populate("cards");
        res.status(200).send(deck);
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
});

deckRouter.get("/:deckId", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        if(req.deck.creator.toString() !== req.userId.toString() && !req.deck.publiclyAvailable) {
            const user = await User.findById(req.userId, "groups");
            if(!req.deck.groupDeckBelongsTo || !user.groups.some(group => group._id.toString() === req.deck.groupDeckBelongsTo.toString())) {
                return res.status(401).send("You are not authorized to view this deck");
            }
        }
        res.status(200).send(req.deck);
    } catch(err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
});

deckRouter.delete("/:deckId", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        if(req.deck.creator.toString() !== req.userId.toString()) {
            const user = await User.findById(req.userId, "groups");
            if(!req.deck.groupDeckBelongsTo || !user.adminOf.some(group => group._id.toString() === req.deck.groupDeckBelongsTo.toString())) {
                return res.status(401).send("You are not authorized to delete this deck");
            }
        }

        if(req.deck.groupDeckBelongsTo) {
            //remove the deck from the group it is in (if applicable)
            const updatedGroup = await Group.findOneAndUpdate({decks: req.deck._id}, {$pull: {decks: req.deck._id}});    
            //remove the deck from the adminOf array of any admins 
            await User.updateMany({adminOf: updatedGroup}, {$pull: {adminOf: req.deck._id}});
        }

        //remove the deck from any category it is in
        await Category.updateMany({decks: req.deck._id}, {$pull: {decks: req.deck._id}});

        //remove the deck from the decks array of the creator
        await User.findByIdAndUpdate(req.deck.creator, {$pull: {decks: req.deck._id}});

        const deckAttempts = await DeckAttempt.find({deck: req.deck._id})
        //delete all card attempts for the cards in the deck
        await CardAttempt.deleteMany({fullDeckAttempt: {$in: deckAttempts}});

        //delete all deck attempts where this deck was attempted
        await DeckAttempt.deleteMany({deck: req.deck._id});

        //delete all cards that were in this deck
        await Card.deleteMany({_id: {$in: req.deck.cards}});

        //delete the deck itself
        const deck = await Deck.findByIdAndDelete(req.deck._id);

        res.status(200).send(deck._id);
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    } 
});

deckRouter.patch("/:deckId", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        if(req.deck.creator.toString() !== req.userId.toString()) {
            const user = await User.findById(req.userId, "groups");
            if(!req.deck.groupDeckBelongsTo || !user.adminOf.some(group => group._id.toString() === req.deck.groupDeckBelongsTo.toString())) {
                return res.status(401).send("You are not authorized to delete this deck");
            }
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
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
    try {
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