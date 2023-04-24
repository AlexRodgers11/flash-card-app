import express from "express";
const deckAttemptRouter = express.Router();

import DeckAttempt from "../models/deckAttempt.js"
import { getUserIdFromJWTToken } from "../utils.js";

deckAttemptRouter.param("attemptId", (req, res, next, attemptId) => {
    DeckAttempt.findById(attemptId, (err, deckAttempt) => {
        if(err) {
            res.status(500).send(err.message);
        } else if(!deckAttempt) {
            res.status(404).send("DeckAttempt not found");
        } else {
            req.deckAttempt = deckAttempt;
            next();
        }
    });
});

deckAttemptRouter.get("/:attemptId", getUserIdFromJWTToken, async (req, res, next) => {
    if(req.userId !== req.deckAttempt.attempter.toString()) {
        return res.send("Unauthorized. Users may only access information about their own practice sessions");
    }
    try {
        const deckAttempt = await req.deckAttempt.populate([
            {
                path: "cards",
                select: "cardType cardId question correctAnswer answeredCorrectly wrongAnswerSelected"
            },
            {
                path: "deck",
                select: "name"
            }
        ]);

        res.status(200).send(deckAttempt);
    } catch (err) {
        res.status(err.status || 500).send(err.message || "There was an error with your request");
    }
});

export default deckAttemptRouter;