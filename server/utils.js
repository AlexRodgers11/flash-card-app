import { FlashCard, MultipleChoiceCard, TrueFalseCard } from "./models/card.js";
import Deck from "./models/deck.js";
import mongoose from "mongoose";
import jwt from "jwt-simple";
import crypto from "crypto";

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

export const copyDeck = async (deckId) => {
    try {
        const foundDeck = await Deck.findById(deckId).populate("cards");
        
        const deckCopy = new Deck({
            name: foundDeck.name,
            publiclyAvailable: false,
            creator: foundDeck.creator,
            attempts: [],
            categories: foundDeck.categories.slice(),
            cards: await Promise.all(foundDeck.cards.map(async card => {
                let copiedCard;
                switch(card.cardType) {
                    case "FlashCard":
                        copiedCard = new FlashCard({
                            creator: card.creator,
                            question: card.question,
                            correctAnswer: card.correctAnswer,
                            hint: card.hint,
                            attempts: [],
                        })
                        break;
                        case "TrueFalseCard":
                            copiedCard = new TrueFalseCard({
                            creator: card.creator,
                            question: card.question,
                            correctAnswer: card.correctAnswer,
                            wrongAnswerOne: card.wrongAnswerOne,
                            hint: card.hint,
                            attempts: [],
                        });
                        break;
                    case "MultipleChoiceCard":
                        copiedCard = new MultipleChoiceCard({
                            creator: card.creator,
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
                    copiedCard._id = new mongoose.Types.ObjectId()
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
    console.log("in getUserIdFromJWTToken");
    const token = req.headers.authorization;
    console.log({token});

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
