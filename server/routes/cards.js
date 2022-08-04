const express = require("express");
const cardRouter = express.Router();

const Card = require("../models/card");
const Deck = require("../models/deck");

cardRouter.param("cardId", (req, res, next, cardId) => {
    Card.findById(cardId, (err, card) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            if(!card) {
                res.status(404).send("Card not found");
            } else {
                req.card = card;
                next();
            }
        }
    });
});

module.exports = cardRouter;