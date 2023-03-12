import express from "express";
const attemptRouter = express.Router();

import DeckAttempt from "../models/deckAttempt.js"
import { getUserIdFromJWTToken } from "../utils.js";

attemptRouter.param("attemptId", (req, res, next, attemptId) => {
    DeckAttempt.findById(attemptId, (err, deckAttempt) => {
        if(err) {
            res.status(500).send(err.message);
            throw err;
        } else if(!deckAttempt) {
            res.status(404).send("DeckAttempt not found");
        } else {
            req.deckAttempt = deckAttempt;
            next();
        }
    });
});

attemptRouter.get("/:attemptId", getUserIdFromJWTToken, async (req, res, next) => {
    if(req.userId !== req.deckAttempt.attempter.toString()) {
        return res.send("Unauthorized. Users may only access information about their own practice sessions");
    }
    try {
        const deckAttempt = await req.deckAttempt.populate([
            {
                path: "cards",
                select: "cardType question correctAnswer answeredCorrectly wrongAnswerSelected"
            },
            {
                path: "deck",
                select: "name"
            }
        ]);

        console.log({deckAttempt});
        res.status(200).send(deckAttempt);
    } catch (err) {
        res.status(err.status || 500).send(err.message || "There was an error with your request");
    }
});

attemptRouter.get("/:attemptId/tile", async (req, res, next) => {
    try {
        const populatedDeckAttempt = await req.deckAttempt.populate("deck", "name");
        const response = {
            //possibly rework model to store deckName instead of id- not sure if good or bad feature for changes to deck name to change the name of deck associated with a session
            deckName: populatedDeckAttempt.deck.name,
            datePracticed: req.deckAttempt.datePracticed,
            accuracyRate: req.deckAttempt.accuracyRate
        }
        res.status(200).send(response);
    } catch (err) {
        res.status(err.status || 500).send(err.message || "There was an error with your request");
    }
});

export default attemptRouter;