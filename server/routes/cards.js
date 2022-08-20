import express from "express";
const cardRouter = express.Router();

import Card from "../models/card.js";
import Deck from "../models/deck.js";

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

cardRouter.delete("/:cardId", (req, res, next) => {
    Card.findByIdAndDelete(req.card._id, (err, card) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            Deck.findOneAndUpdate({cards: card._id}, {$pull: {cards: card._id}}, (err, deck) => {
                if(err) {
                    res.status(500).send("There was an error with your request");
                    throw err;
                } else {
                    res.status(200).send({card: card, deck: deck});
                }
            });
        }
    });
});

export default cardRouter;