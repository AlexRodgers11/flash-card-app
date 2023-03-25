import { FlashCard, MultipleChoiceCard, TrueFalseCard } from "./models/card.js";
import Deck from "./models/deck.js";
import mongoose from "mongoose";
import jwt from "jwt-simple";
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";

const characters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9','!','@','#','$','%','&','=','?'];

export const generateCode = (characterCount) => {
    let code = [];
    while (code.length < characterCount) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

const getRandomCardType = num => {
    if(num < .33) {
        return "multiple-choice"
    } else if(num < .66) {
        return "true-false"
    } else {
        return "flash"
    }
}
export const getRandomJoinOptions = () => {
    let num = Math.random();
    if(num <= .25) {
        return "invite";
    } else if(num <= .5) {
        return "request";
    } else if(num <= .75) {
        return "code";
    } else {
        return "code-and-request"
    }
}

export const swapIndexes = (arr, idx1, idx2) => {
    [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
}

export default getRandomCardType;

export const generateRandomFileName = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

export const copyDeck = async (deckId, userId, groupId) => {
    try {
        const foundDeck = await Deck.findById(deckId).populate("cards");
        
        const deckCopy = new Deck({
            name: foundDeck.name,
            publiclyAvailable: false,
            creator: userId,
            attempts: [],
            categories: foundDeck.categories.slice(),
            cards: await Promise.all(foundDeck.cards.map(async card => {
                let copiedCard;
                switch(card.cardType) {
                    case "FlashCard":
                        copiedCard = new FlashCard({
                            creator: userId,
                            question: card.question,
                            correctAnswer: card.correctAnswer,
                            hint: card.hint,
                            attempts: [],
                        })
                        break;
                        case "TrueFalseCard":
                            copiedCard = new TrueFalseCard({
                            creator: userId,
                            question: card.question,
                            correctAnswer: card.correctAnswer,
                            wrongAnswerOne: card.wrongAnswerOne,
                            hint: card.hint,
                            attempts: [],
                        });
                        break;
                    case "MultipleChoiceCard":
                        copiedCard = new MultipleChoiceCard({
                            creator: userId,
                            question: card.question,
                            correctAnswer: card.correctAnswer,
                            wrongAnswerOne: card.wrongAnswerOne,
                            wrongAnswerTwo: card.wrongAnswerTwo,
                            wrongAnswerThree: card.wrongAnswerThree,
                            hint: card.hint,
                            attempts: [],
                        });
                        break;
                    default: 
                        break;
                    }
                    copiedCard._id = new mongoose.Types.ObjectId();
                    copiedCard.groupCardBelongsTo = groupId || null;
                    const savedCardCopy = await copiedCard.save();
                    return savedCardCopy;
                }))
            });
        await Promise.all(deckCopy.cards);
        return deckCopy;
    } catch (err) {
        console.error(err);
    }
}

export const getUserIdFromJWTToken = (req, res, next) => {
    const token = req.headers.authorization;
    // console.log({token});

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized: No token provided'
        });
    }

    try {
        const decoded = jwt.decode(token.slice(7), process.env.TOKEN_KEY);
        req.userId = decoded.sub;
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorized: Invalid token'
        });
    }
};


export const xhrOnly = (req, res, next) => {
    if (req.xhr) {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    } else {
        res.status(400).send("Bad request");
    }
}

export const baseRateLimiter = rateLimit({
    max: 300,
    message: "Too many requests to baseRateLimiter, please try again later"
});

export const extendedRateLimiter = rateLimit({
    max: 2500,
    message: "Too many requests to extendedRateLimiter, please try again later"
});

// modified version of Geelie's answer to this question https://stackoverflow.com/questions/27117337/exclude-route-from-express-middleware
export const excludingPaths = (pathRegexes, middleware) => {
    return (req, res, next) =>  {
        let shouldExclude = false;
        pathRegexes.forEach((pathRegex) => {
            if(pathRegex.test(req.path)) {
                shouldExclude = true;
            }
        });

        if(shouldExclude) {
            return next();
        } else {
            return middleware(req, res, next);
        }
    }
}
