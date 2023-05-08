import { FlashCard, MultipleChoiceCard, TrueFalseCard } from "./models/card.js";
import Deck from "./models/deck.js";
import mongoose from "mongoose";
import jwt from "jwt-simple";
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";
import multer from "multer";
import {createTransport} from "nodemailer";


const characters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9','!','@','#','$','%','&','=','?'];

export const generateCode = (characterCount) => {
    let code = [];
    while (code.length < characterCount) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    return code;
}

////Durstenfeld shuffle, copied from https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
export const shuffleArray = (array) => {
    let arrayCopy = [...array];
    for (let i = arrayCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    return arrayCopy;
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

export const fileFilter = (req, file, callback) => {
    if(file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        callback(null, true);
    } else {
        callback(new Error("Only jpeg and png file types may be submitted"), false);
    }
};

//figure out how to handle errors for fileSize, etc
export const storage = multer.memoryStorage();
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

export const sendEmail = async (emailAddress, message) => {
    let transporter = createTransport({
        host: "smtp-relay.sendinblue.com",
        port: process.env.SEND_IN_BLUE_PORT,
        secure: false,
        auth: {
            user: process.env.SEND_IN_BLUE_USER,
            pass: process.env.SEND_IN_BLUE_PASSWORD
        }
    });
    
    const mailObj = {
        from: '"FlishFlash" <flashcardapp@example.com>',
        to: `${emailAddress}`
    }

    switch(message.messageType) {
        case "DeckSubmission":
            mailObj.subject = "New Deck Submitted to One of Your Groups";
            mailObj.html = (
                `<html>
                    <body>
                        <p>${message.sendingUser.name.first} ${message.sendingUser.name.last} submitted a deck to be added to group ${message.targetGroup.name}</p>

                        <p>Login to review the request:</p>
                        <a href="https://www.flishflash.org" style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Log In</a>
                    </body>
                </html>`
            )
            break;
        case "CardSubmission":
            mailObj.subject = `New Card Submitted to Deck ${message.targetDeck.name} in Group ${message.targetGroup.name}`;
            mailObj.html = (
                `<html>
                    <body>
                        <p>${message.sendingUser.name.first} ${message.sendingUser.name.last} submitted the following card to be added to deck ${message.targetDeck.name} in group ${message.targetGroup.name}</p>

                        <br />

                        <p>Card Type: ${message.cardData.cardType}</p>
                        <p>Question: ${message.cardData.question}</p>
                        ${message.cardData.hint ? 
                            `<p>Hint: ${message.cardData.hint}</p>`
                            :
                            ""
                        }
                        <p>Correct Answer: ${message.cardData.correctAnswer}</p>
                        ${message.cardData.cardType === "MultipleChoiceCard" ? 
                            `<p>Wrong Answer One: ${message.cardData.wrongAnswers[0]}</p>
                            <p>Wrong Answer Two: ${message.cardData.wrongAnswers[1]}</p>
                            <p>Wrong Answer Three: ${message.cardData.wrongAnswers[2]}</p>`
                            :
                            ""
                        }

                        <p>Login to review the request:</p>
                        <a href="https://www.flishflash.org" style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Log In</a>
                    </body>
                </html>`
            )
            break;
        case "DeckDecision":
            mailObj.subject = `Your submission of ${message.deckName} to group ${message.targetGroup.name} has been ${message.acceptanceStatus}`;
            mailObj.html = (
                `<html>
                    <body>
                        <p>${message.sendingUser.name.first} ${message.sendingUser.name.last} ${message.acceptanceStatus} your request to add deck to the group ${message.targetGroup.name}${message.comment ? " and left this comment:" : "."}</p>
                        ${message.comment ? "<br />" : ""}
                        ${message.comment ? `<em>${message.comment}</em>` : ""}
                    </body>
                </html>`
            )
            break;
        case "CardDecision":
            mailObj.subject = `Your card submission to ${message.targetGroup.name} has been ${message.acceptanceStatus}`;
            mailObj.html = (
                `<html>
                    <body>
                        <p>${message.sendingUser.name.first} ${message.sendingUser.name.last} ${message.acceptanceStatus} your request to add card "${message.cardData.question}" to deck ${message.targetDeck.name} in the group ${message.targetGroup.name}${message.comment ? " and left this comment:" : "."}</p>
                        ${message.comment ? "<br />" : ""}
                        ${message.comment ? `<em>${message.comment}</em>` : ""}
                    </body>
                </html>`
            )
            break;
        case "DirectMessage":
            mailObj.subject = `${message.sendingUser.name.first} ${message.sendingUser.name.last} Sent You a Message`;
            mailObj.html = (
                `<html>
                    <body>
                        <p>${message.sendingUser.name.first} ${message.sendingUser.name.last} sent you the following message:</p>
                        <br />
                        <br />
                        <em>${message.text}</em>
                        <hr />
                        <hr />
                        <p>Log in to respond</p>
                    </body>
                </html>`
            )
            break;
        case "GroupInvitation":
            mailObj.subject = `${message.sendingUser.name.first} ${message.sendingUser.name.last} Invited you to Join the Group ${message.targetGroup.name}`;
            mailObj.html = (
                `<html>
                    <body>
                        <p>${message.sendingUser.name.first} ${message.sendingUser.name.last} invited you to join the group ${message.targetGroup.name}${message.comment ? " and included this comment:" : "."}</p>
                        ${message.comment ? "<br />" : ""}
                        ${message.comment ? `<em>${message.comment}</em>` : ""}
                        <hr />
                        <hr />
                        <p>Log in to respond</p>
                    </body>
                </html>`
            )
            break;
        case "InvitationDecision":
            mailObj.subject = `${message.sendingUser.name.first} ${message.sendingUser.name.last} Responded to an Invitation to Join Group ${message.targetGroup.name}`;
            mailObj.html = (
                `<html>
                    <body>
                        <p>${message.sendingUser.name.first} ${message.sendingUser.name.last} ${message.acceptanceStatus === "approved" ? "accepted" : "declined"} an invitation to join group ${message.targetGroup.name}</p>
                    </body>
                </html>`
            )
            break;
        case "JoinRequest":
            mailObj.subject = `A User Would Like to Join ${message.targetGroup.name}`;
            mailObj.html = (
                `<html>
                    <body>
                        <p>${message.sendingUser.name.first} ${message.sendingUser.name.last} is requesting to join ${message.targetGroup.name}</p>

                        <p>Login to review the request:</p>
                        <a href="https://www.flishflash.org" style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Log In</a>
                    </body>
                </html>`
            );
            break;
        case "JoinDecision":
            mailObj.subject = `Your request to join ${message.targetGroup.name} has been ${message.acceptanceStatus}`;
            mailObj.html = (
                `<html>
                    <body>
                        <p>${message.sendingUser.name.first} ${message.sendingUser.name.last} ${message.acceptanceStatus} your request to join ${message.targetGroup.name}${message.comment ? " and left this comment:" : "."}</p>
                        ${message.comment ? "<br />" : ""}
                        ${message.comment ? `<em>${message.comment}</em>` : ""}
                    </body>
                </html>`
            )
            break;
        default: 
            res.status(400).send("An invalid message type was selected to create an email from");
    }
    await transporter.sendMail(mailObj);
}