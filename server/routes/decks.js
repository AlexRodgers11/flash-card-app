const express = require("express");
const deckRouter = express.Router();

const Attempt = require("../models/attempt");
const Card = require("../models/card");
const Deck = require("../models/deck");
const Group = require("../models/group");
const Category = require("../models/category");
const User = require("../models/user");
const deck = require("../models/deck");

deckRouter.param("deckId", (req, res, next, deckId) => {
    Deck.findById(deckId, (err, deck) => {
        if(err) {
            res.status(500).send("There was an error with your request");
        } else {
            if(!deck) {
                res.status(404).send("Deck not found");
            } else {
                req.deck = deck;
                next();
            }
        }
    });
});

//come back and add logic to only send a certain number at a time and load more on scroll down
deckRouter.get("/", (req, res, next) => {
    Deck.find({}, (err, decks) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(decks);
        }
    });
});

deckRouter.post("/", (req, res, next) => {
    let newDeck = new Deck(req.body);
    newDeck.save((err, deck) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(deck);
        }
    });
});

deckRouter.get("/:deckId", (req, res, next) => {
    if(req.query.thumbnail) {
        User.findById(req.deck.creator, (err, user) => {
            if(err) {
                res.status(500).send("There was an error with your request");
                throw err;
            } else {
                let response = {
                    name: req.deck.name,
                    public: req.deck.public,
                    creator: user.login.username,
                    dateCreated: req.deck.dateCreated,
                    cardCount: req.deck.cards.length,
                    permissions: req.deck.permissions
                };
                res.status(200).send(JSON.stringify(response));
            }
        });
    } else {
        res.status(200).send(req.deck);
    }
});

deckRouter.delete("/:deckId", (req, res, next) => {
    Deck.findByIdAndDelete(req.deck._id)
        .catch(err => {
            res.status(500).send("There was an error with your request");
            throw err;
        })
        .then(() => {
            Card.deleteMany({_id: {$in: req.deck.cards}})
                .catch(err => {
                    res.status(500).send("There was an error with your request");
                    throw err;
                })
                .then(() => {
                    Group.updateMany({decks: req.deck._id}, {$pull: {decks: req.deck._id}})
                        .catch(err => {
                            res.status(500).send("There was an error with your request");
                            throw err;
                        })
                        .then(() => {
                            Attempt.deleteMany({deck: req.deck._id})
                                .catch(err => {
                                    res.status(500).send("There was an error with your request");
                                })
                                .then(() => {
                                    Category.updateMany({decks: req.deck._id}, {$pull: {decks: req.deck._id}}, (err, categories) => {
                                        if(err) {
                                            res.status(500).send("There was an error with your request");
                                            throw err;
                                        } else {
                                            res.status(200).send(req.deck);
                                        }
                                    });
                                })
                        })
                })
        });
});

deckRouter.put("/:deckId", (req, res, next) => {
    Deck.findByIdAndUpdate(req.deck._id, req.body, (err, deck) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            res.status(200).send(deck);
        }
    });
});

deckRouter.post("/:deckId/cards", (req, res, next) => {
    let newCard = new Card(req.body);
    newCard.save((err, card) => {
        if(err) {
            res.status(500).send("There was an error with your request");
            throw err;
        } else {
            Deck.findByIdAndUpdate(req.deck._id, {$push: {cards: card}}, (err, deck) => {
                if(err) {
                    res.status(500).send("There was an error with your request");
                    throw err;
                } else {
                    res.status(200).send(deck);
                }
            });
        }
    });
});

module.exports = deckRouter;