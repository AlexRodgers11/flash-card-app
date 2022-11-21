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

export default attemptRouter;