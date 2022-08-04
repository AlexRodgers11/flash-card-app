const express = require("express");
const deckRouter = express.Router();

const Deck = require("../models/deck");

deckRouter.param("deckId", (req, res, next, deckId) => {
    Deck.findById(deckId, (err, deck) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            if(!deck) {
                res.status(404).send("Deck not found");
            } else {
                req.deck = deck;
                next();
            }
        }
    });
});

//come back and add logic to only send a certain number at a time and load more on scroll down
deckRouter.get("/", (req, res, next) => {
    Deck.find({}, (err, decks) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(decks);
        }
    });
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

deckRouter.get("/:deckId", (req, res, next) => {
    res.status(200).send(req.deck);
});

module.exports = deckRouter;