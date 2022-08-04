const express = require("express");
const deckRouter = express.Router();

const Deck = require("../models/deck");

deckRouter.param("groupId", (req, res, next, deckId) => {
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

module.exports = deckRouter;