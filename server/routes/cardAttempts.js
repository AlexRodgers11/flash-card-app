import express from "express";
import CardAttempt from "../models/cardAttempt.js";
const cardAttemptRouter = express.Router();

cardAttemptRouter.param("cardAttemptId", (req, res, next, cardAttemptId) => {
    CardAttempt.findById(cardAttemptId, (err, cardAttempt) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } if(!cardAttempt) {
            res.status(404).send("Card not found");
        } else {
            req.cardAttempt = cardAttempt;
            next();
        }
        
    });
});

// cardAttemptRouter.get("/:cardAttemptId", async(req, res, next) => {
//     res.status(200).send(req.cardAttempt);
// });

export default cardAttemptRouter;