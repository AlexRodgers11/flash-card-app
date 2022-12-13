import express from "express";
const cardRouter = express.Router();

import { Card } from "../models/card.js";
import Deck from "../models/deck.js";

cardRouter.param("cardId", (req, res, next, cardId) => {
    Card.findById(cardId, (err, card) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } if(!card) {
            res.status(404).send("Card not found");
        } else {
            req.card = card;
            next();
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

cardRouter.delete("/:cardId", async (req, res, next) => {
    try {
        const card = await Card.findByIdAndDelete(req.card._id);
        const deck = await Deck.findOneAndUpdate({cards: card._id}, {$pull: {cards: card._id}});
        res.status(200).send(card._id);
    } catch (err) {
        res.status(500).send("There was an error with your request");
        throw err;
    }
});

cardRouter.get("/:cardId/tile-stats", async (req, res, next) => {
    try {
        let populatedCard = await req.card.populate("attempts", "createdAt answeredCorrectly");
        const responseObj = {
            cardQuestion: req.card.question,
            dateLastPracticed: populatedCard.attempts[0]?.createdAt || "Not practiced yet",
            attemptCount: populatedCard.attempts.length,
            accuracyRate: populatedCard.attempts.length > 0 ? Math.round(populatedCard.attempts.reduce((acc, curr) => acc + (curr.answeredCorrectly ? 1 : 0), 0) * 100 / populatedCard.attempts.length) : undefined
        }
        res.status(200).send(responseObj);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

cardRouter.get("/:cardId/attempts", (req, res, next) => {
    res.status(200).send(req.card.attempts);
});

export default cardRouter;