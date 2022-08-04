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

cardRouter.get("/:cardId", (req, res, next) => {
    res.status(200).send(req.card);
});

cardRouter.put("/:cardId", (req, res, next) => {
    Card.findByIdAndUpdate(req.card._id, req.body, (err, card) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(card);
        }
    });
});

module.exports = cardRouter;