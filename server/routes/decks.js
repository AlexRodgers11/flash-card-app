import express from "express";
const deckRouter = express.Router();
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

import Attempt from "../models/attempt.js";
import { Card, FlashCard, MultipleChoiceCard, TrueFalseCard } from "../models/card.js";
import Deck from "../models/deck.js";
import Group from "../models/group.js";
import Category from "../models/category.js";
import User from "../models/user.js";

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

//come back and add logic to only send a certain number at a time and load more on scroll down
deckRouter.get("/", async (req, res, next) => {
    try {
        if(req.query.categoryId) {
            let category = await Category.findById(req.query.categoryId, "decks").populate("decks", "name");
            if(req.query.searchString) {
                let filteredDecks = category.decks.filter(deck => deck.name.toLowerCase().includes(req.query.searchString.toLowerCase()));
                res.status(200).send(filteredDecks);
            } else {
                res.status(200).send(category.decks.map(deck => deck._id));
            }
        } else {
            let decks = await Deck.find({}, "name");
            res.status(200).send(decks);
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

deckRouter.get("/:deckId/tile", (req, res, next) => {
    User.findById(req.deck.creator, (err, user) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } 
        let response = {
            name: req.deck.name,
            publiclyAvailable: req.deck.publiclyAvailable,
            creator: user.login.username,
            createdAt: req.deck.createdAt,
            cardCount: req.deck.cards.length,
            permissions: req.deck.permissions
        };
        res.status(200).send(JSON.stringify(response));
        
    });
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
        await Attempt.deleteMany({deck: req.deck._id});
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

deckRouter.post("/:deckId/cards", async (req, res, next) => {
    let cardType = req.body.cardType;
    delete req.body.cardType;
    let newCard;
    switch(cardType) {
        case "FlashCard":
            newCard = new FlashCard(req.body);
            break;
        case "TrueFalseCard":
            newCard = new TrueFalseCard(req.body);
            break;
        case "MultipleChoiceCard":
            newCard = new MultipleChoiceCard(req.body);
            break;
        default:
            res.status(500).send("Invalid card type selected");
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

export default deckRouter;