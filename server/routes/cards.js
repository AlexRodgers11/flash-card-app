import express from "express";
const cardRouter = express.Router();

import { Card, FlashCard, MultipleChoiceCard, TrueFalseCard } from "../models/card.js";
import User from "../models/user.js"
import Deck from "../models/deck.js";
import { getUserIdFromJWTToken } from "../utils.js";

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

cardRouter.get("/:cardId", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        if(req.userId !== req.card.creator.toString()) {
            const user = await User.findById(req.userId, "groups")
                .populate({
                    path: "groups",
                    select: "decks",
                    populate: {
                        path: "decks",
                        select: "cards"
                    }
                });
            if(!req.card.groupCardBelongsTo || !user.groups.some(group => group._id.toString() === req.card.groupCardBelongsTo.toString())) {
                return res.status(401).send("You are not authorized to view this card");
            }
        }
        res.status(200).send(req.card);
    } catch (err) {
        res.status(500).send(err.message);
        console.log(err.message);
    }
});

cardRouter.put("/:cardId", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        if(req.card.groupCardBelongsTo) {
            const foundGroup = await Group.findById(req.card.groupCardBelongsTo, "administrators");
            if(!foundGroup.administrators.map(admin => admin.toString()).includes(req.userId)) {
               return res.status(403).send("Only this card's group administrators can update this card");
                
            }
        } else if(req.userId !== req.card.creator.toString()) {
            return res.status(403).send("Only this card's creator can update it");
        }
        
        let updatedCard;

        switch(req.body.cardType) {
            case "FlashCard":
                if(req.card.cardType === "FlashCard") {
                    updatedCard = await FlashCard.findByIdAndUpdate(req.card._id, req.body, {new: true});
                } else {
                    await Card.findByIdAndDelete(req.card._id);
                    let newCard = new FlashCard({...req.body, _id: req.card._id});
                    updatedCard = await newCard.save();
                }
                break;
            case "TrueFalseCard":
                if(req.card.cardType === "TrueFalseCard") {
                    updatedCard = await TrueFalseCard.findByIdAndUpdate(req.card._id, req.body, {new: true})
                } else {
                    await Card.findByIdAndDelete(req.card._id);
                    let newCard = new TrueFalseCard({...req.body, _id: req.card._id});;
                    updatedCard = await newCard.save();
                    console.log({updatedCard});
                }
                break;
            case "MultipleChoiceCard":
                if(req.card.cardType === "MultipleChoiceCard") {
                    updatedCard = await MultipleChoiceCard.findByIdAndUpdate(req.card._id, req.body, {new: true})
                } else {
                    await Card.findByIdAndDelete(req.card._id);
                    let newCard = new MultipleChoiceCard({...req.body, _id: req.card._id});;
                    updatedCard = await newCard.save();
                }
                break;
        }
        
        res.status(200).send(updatedCard);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

cardRouter.delete("/:cardId", getUserIdFromJWTToken, async (req, res, next) => {
    try {
        if(req.card.groupCardBelongsTo) {
            const foundGroup = await Group.findById(req.card.groupCardBelongsTo, "administrators");
            if(!foundGroup.administrators.map(admin => admin.toString).includes(req.userId)) {
                res.status(403).send("Only this card's group administrators can delete it");
                return;
            }
        } else if(req.userId !== req.card.creator.toString()) {
            res.status(403).send("Only this card's creator can delete it");
            return;
        }

        const card = await Card.findByIdAndDelete(req.card._id);
        const deck = await Deck.findOneAndUpdate({cards: card._id}, {$pull: {cards: card._id}});
        res.status(200).send(card._id);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

cardRouter.get("/:cardId/attempts", getUserIdFromJWTToken, async (req, res, next) => {
    if(req.userId !== req.card.creator.toString()) {
        return res.status(401).send("Unauthorized. Users may only view their own card attempts");
    }
    try {
        const populatedCard = await req.card.populate({
            path: "attempts",
            select: "datePracticed answeredCorrectly fullDeckAttempt wrongAnswerSelected"
        });
        let responseObj = {
            attempts: populatedCard.attempts,
            selectedCard: {
                _id: req.card._id,
                cardType: req.card.cardType,
                question: req.card.question,
                answer: req.card.correctAnswer
            }
        } 
        
        res.status(200).send(responseObj);
    } catch (err) {
        res.status(500).send("There was an error with your request");
    }
});


export default cardRouter;