import express from "express";
const attemptRouter = express.Router();

import Attempt from "../models/attempt.js"

attemptRouter.param("attemptId", (req, res, next, attemptId) => {
    Attempt.findById(attemptId, (err, attempt) => {
        if(err) {
            res.status(500).send(err.message);
            throw err;
        } else if(!attempt) {
            res.status(404).send("Attempt not found");
        } else {
            req.attempt = attempt;
            next();
        }
    });
});

attemptRouter.get("/:attemptId", async (req, res, next) => {
    try {
        const attempt = await req.attempt.populate("deck", "name");
        res.status(200).send(attempt);
    } catch (err) {
        res.status(err.status || 200).send(err.message || "There was an error with your request");
    }
});

attemptRouter.get("/:attemptId/tile", async (req, res, next) => {
    try {
        const populatedAttempt = await req.attempt.populate("deck", "name");
        const response = {
            //possibly rework model to store deckName instead of id- not sure if good or bad feature for changes to deck name to change the name of deck associated with a session
            deckName: populatedAttempt.deck.name,
            datePracticed: req.attempt.datePracticed,
            accuracyRate: req.attempt.accuracyRate
        }
        res.status(200).send(response);
    } catch (err) {
        res.status(err.status || 500).send(err.message || "There was an error with your request");
    }
});

export default attemptRouter;