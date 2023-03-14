import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import faker from "faker";
import DeckAttempt from "./models/deckAttempt.js";
import { Card, FlashCard, MultipleChoiceCard, TrueFalseCard } from "./models/card.js";
import Category from "./models/category.js";
import Deck from "./models/deck.js";
import Group from "./models/group.js";
import User from "./models/user.js";
import Activity from "./models/activity.js";
import CardAttempt from "./models/cardAttempt.js";
// import getRandomCardType, { generateCode, getRandomJoinOptions } from "./utils.js";
import getRandomCardType, { generateCode, getRandomJoinOptions, generateRandomFileName, baseRateLimiter, excludingPaths } from "./utils.js";
import * as fs from "fs";

import multer from "multer";
import { getObjectSignedUrl, uploadFile } from "./s3.js";
const port = process.env.port || 8000;
const router = express.Router();

import activityRouter from "./routes/activity.js";
import deckAttemptRouter from "./routes/deckAttempts.js";
import cardAttemptRouter from "./routes/cardAttempts.js";
import cardRouter from "./routes/cards.js";
import categoryRouter from "./routes/categories.js";
import communicationRouter from "./routes/communications.js";
import deckRouter from "./routes/decks.js";
import groupRouter from "./routes/groups.js";
import loginRouter, { requireSignIn } from "./routes/login.js";
import messageRouter from "./routes/message.js";
import notificationRouter from "./routes/notification.js";
import userRouter from "./routes/users.js"

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import jwt from "jwt-simple"; 
import { ExtractJwt } from "passport-jwt";
import { Strategy as JwtStrategy } from  "passport-jwt";
import group from "./models/group.js";

import dotenv from "dotenv";

dotenv.config();

mongoose.connect("mongodb://localhost/flash-card-app-one", {
// mongoose.connect("mongodb://WOLVES-DEN:27017,WOLVES-DEN:27018,WOLVES-DEN:27019/flash-card?replicaSet=rs", {
    //use MongoDB's new connection string parser instead of the old deprecated one
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();

//use body-parsing middleware that only parses json
app.use(bodyParser.json());



//set response headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, PATCH, PUT, POST, DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});

//use url-encoding middleware that allows for a wider array of data to be encoded
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(passport.initialize());

app.use(excludingPaths([/\/decks\/([0-9A-Za-z]+([A-Za-z]+[0-9A-Za-z]+)+)\/tile/i, /\/users\/([0-9A-Za-z]+([A-Za-z]+[0-9A-Za-z]+)+)\/tile/i], baseRateLimiter));

app.use("/activities", activityRouter);
app.use("/attempts", deckAttemptRouter);
app.use("/card-attempts", cardAttemptRouter);
app.use("/cards", cardRouter);
app.use("/categories", categoryRouter);
app.use("/communications", communicationRouter);
app.use("/decks", deckRouter);
app.use("/groups", groupRouter);
app.use("/login", loginRouter);
app.use("/messages", messageRouter);
app.use("/notifications", notificationRouter);
app.use("/users", userRouter);

router.get("/test", (req, res, next) => {
    console.log("connected");
    res.status(200).send("connected");
});









// const fileFilter = (req, file, callback) => {
//     if(file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//         callback(null, true);
//     } else {
//         callback(new Error("Only jpeg and png file types may be submitted"), false);
//     }
// };



// const storage = multer.memoryStorage();
// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 1024 * 1024 * 5
//     },
//     fileFilter: fileFilter
// });

// import deku from "./pic-seed/Deku Profile.png";

const routes = ["./pic-seed/Trunks Profile.PNG", "./pic-seed/Deku-Profile.png", "./pic-seed/Kacchan Profile.PNG", "./pic-seed/Kirito Profile.PNG"];

router.get("/test-seed-photo", async(req, res, next) => {
    // console.log({mimetype: deku.mimetype});
    let randomNum = Math.floor(Math.random() * routes.length);  
    // let photo = fs.readFileSync("./pic-seed/Trunks Profile.png");
    let photo = fs.readFileSync(routes[randomNum]);

    try {
        let photoName = generateRandomFileName();
        await uploadFile(photo, photoName, "image");

        const photoURL = await getObjectSignedUrl(photoName);
        console.log({photoURL});
        res.status(200).send(photoURL);
    } catch (err) {
        console.error(err);
    }
});


router.get("/seed-database", async(req, res, next) => {
    try {
        console.log("Creating users");
        const userPromises = [];
        // while (userPromises.length < 3000) {
        // while (userPromises.length < 1500) {
        while (userPromises.length < 2250) {
            userPromises.push(new Promise((userResolve, userReject) => {
                let newUser = new User();
                newUser.login.username = faker.random.word() + faker.random.word();
                newUser.login.password = faker.hacker.phrase().replace(/\s/g, "") + Math.ceil(Math.random() * 100);
                let names = faker.name.findName().split(" ");
                newUser.name.first = names[0];
                newUser.name.last = names[1];
                newUser.login.email = faker.internet.email();
                newUser.photo = faker.image.people();
                newUser.verification = {
                    code: generateCode(6),
                    // codeExpDate: Math.round(Date.now() / 1000 + 30 * 24 * 60 * 60),
                    codeExpDate: Date.now() + (100 * 60 * 60 * 24 * 3),
                    verified: true
                };
                newUser.accountSetupStage = "complete";
                newUser.save((err, savedUser) => {
                    if(err) {
                        userReject(err);
                        throw err;
                    }
                    userResolve(savedUser);
                });
            }));   
        }
        console.log(userPromises[0]);
        const users = await Promise.all(userPromises);
        console.log(users[0]._id);
        console.log("Done creating users");

        console.log("Creating groups");
        const groupPromises = [];
        // while(groupPromises.length < 750) {
        // while(groupPromises.length < 375) {
        while(groupPromises.length < 188) {
            groupPromises.push(new Promise((groupResolve, groupReject) => {
                let newGroup = new Group();
                newGroup.name = faker.random.word() + Math.ceil(Math.random() * 100);
                newGroup.decks = [];
                newGroup.joinOptions = getRandomJoinOptions();
                newGroup.joinCode = newGroup.joinOptions === "code" || newGroup.joinOptions === "code-and-request" ? generateCode(12) : "";
                users.forEach(user => {
                    if(Math.random() > .993) {
                        newGroup.members.push(user._id);
                    }
                });
                if(newGroup.members.length < 1) {
                    newGroup.members.push(users[Math.floor(Math.random() * users.length)]);
                }
                newGroup.creator = newGroup.members[0];
                if(newGroup.members.length > 5) {
                    newGroup.administrators = newGroup.members.slice(0,5);
                } else {
                    newGroup.administrators = [newGroup.creator];
                }
                newGroup.save((err, savedGroup) => {
                    if(err) {
                        groupReject(err);
                        throw err;
                    }
                    groupResolve(savedGroup);
                });
            }));
        }
        const groups = await Promise.all(groupPromises);
        console.log("Finished creating groups");

        console.log("Setting adminOf property of admins and adding groups to members' groups array");
        // for(group of groups) {
        for(let i = 0; i < groups.length; i++) {
            await User.updateMany({_id: {$in: groups[i].administrators}}, {$push: {adminOf: groups[i]._id}});
            await User.updateMany({_id: {$in: groups[i].members}}, {$push: {groups: groups[i]._id}})
        }
        console.log("Done setting adminOf property of admins and adding groups to members' groups array");

        console.log("Creating activities and adding them to groups");
        // for await (const group of Group.find()) {
        // for (const group of groups) {
        for (let i = 0; i < groups.length; i++) {
            // console.log({i});
            let newActivity = new Activity();
            // console.log("Activity created");
            newActivity.actor = groups[i].creator;
            newActivity.type = 'create-group';
            newActivity.content = '';
            newActivity.groupTarget = groups[i]._id;
            const savedActivity = await newActivity.save();
            // console.log("Activity saved");
            console.log("Updating groups");
            // console.log(`savedActivityId: ${savedActivity._id}`);
            // console.log(groups[i]._id);
            await Group.findByIdAndUpdate(groups[i]._id, {$set: {activities: [savedActivity._id]}});
            console.log("Done updating groups");
        }
        console.log("Done creating activities and adding them to groups");

        console.log("Creating categories");
        const categoryPromises = [];
        while(categoryPromises.length < 50) {
            categoryPromises.push(new Promise((categoryResolve, categoryReject) => {
                let newCategory = new Category();
                newCategory.name = faker.hacker.noun() + faker.hacker.adjective() + faker.hacker.verb();
                newCategory.save((err, category) => {
                    if(err) {
                        categoryReject(err);
                        throw err;
                    }
                    categoryResolve(category)
                });
            }));
        }
        const categories = await Promise.all(categoryPromises);
        console.log("Done creating categories");

        console.log("Creating decks");
        const deckPromises = [];
        // let randomDeckNumber = 5000 + Math.ceil(Math.random() * 10000);
        // let randomDeckNumber = 45000;
        // let randomDeckNumber = 30000;
        let randomDeckNumber = 15000;

        while(deckPromises.length < randomDeckNumber) {
            deckPromises.push(new Promise((deckResolve, deckReject) => {
                let newDeck = new Deck();
                newDeck.categories = [];
                for(let i = 0; i < categories.length; i++) {
                    if(Math.random() < 0.06) {
                        newDeck.categories.push(categories[i]._id);
                    }
                }
                newDeck.name = faker.hacker.adjective();
                newDeck.publiclyAvailable = Math.random() > .7 ? true : false;
                let randomNum = Math.floor(Math.random() * users.length);

                let randomUserId = users[randomNum]._id;
                // console.log({randomUserId});
                newDeck.creator = randomUserId;
                //possibly add categories here
                newDeck.save((err, deck) => {
                    if(err) {
                        deckReject(err);
                        throw err;
                    }
                    deckResolve(deck);
                });
            }));
        }
        let decks = await Promise.all(deckPromises);
        for(let i = 0; i < decks.length; i++) {
            for(let j = 0; j < decks[i].categories.length; j++) {
                await Category.findByIdAndUpdate(decks[i].categories[j]._id, {$push: {decks: decks[i]}});
            }
        }
        console.log("Done creating decks");
        
        console.log("Adding decks to users' decks arrays and decks to categories and adding cards to decks");
        // for await(const deck of Deck.find()) {
        // for (const deck of decks) {
        console.log("Starting for loop");
        for (let i = 0; i < decks.length; i++) {
            //add the deck to the deck's creator's decks array
            await User.findByIdAndUpdate(decks[i].creator, {$push: {decks: decks[i]._id}});
            // console.log("User's decks array updated");

            //add deck to random categories
            // for(const category of categories) {
            for(let i = 0; i < categories.length; i++) {
                if(Math.random() > .9) {
                    await Category.findByIdAndUpdate(categories[i]._id, {$push: {decks: decks[i]._id}});
                }
            }
            // console.log("Categories updated");

            //create cards for each deck
            // let randomCardNumber = 2 + Math.ceil(Math.random() * 11);
            // let randomCardNumber = 4 + Math.ceil(Math.random() * 6);
            let randomCardNumber = 3 + Math.ceil(Math.random() * 9);
            const cardPromises = [];
            // console.log("creating cards");
            while(cardPromises.length < randomCardNumber) {
                cardPromises.push(new Promise((cardResolve, cardReject) => {
                    let cardTypeDecider = Math.random();
                    let newCard;
                    if(cardTypeDecider <= .3333) {
                        newCard = new FlashCard({_id: new mongoose.Types.ObjectId()});
                        newCard.correctAnswer = Math.random() > .5 ? faker.hacker.noun() : faker.hacker.phrase();
                    } else if(cardTypeDecider <= .6666) {
                        newCard = new TrueFalseCard({_id: new mongoose.Types.ObjectId()});
                        newCard.correctAnswer = Math.random() > .5 ? "True" : "False";
                        newCard.wrongAnswerOne = newCard.correctAnswer === "True" ? "False" : "True";
                    } else {
                        newCard = new MultipleChoiceCard({_id: new mongoose.Types.ObjectId()});
                        const randomNum = Math.random();
                        newCard.correctAnswer = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
                        newCard.wrongAnswerOne = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
                        newCard.wrongAnswerTwo = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
                        newCard.wrongAnswerThree = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
                    }
                    newCard.creator = decks[i].creator;
                    newCard.question = faker.hacker.phrase();
                    newCard.hint = Math.random() > .7 ? faker.hacker.phrase() : '';
                    // const deckAttemptCount = Math.floor(Math.random() * 15);
                    // newCard.stats.numberCorrect = deckAttemptCount - Math.floor(Math.random() * deckAttemptCount);
                    // newCard.stats.numberIncorrect = deckAttemptCount - newCard.stats.numberCorrect;
                    newCard.save((err, savedCard) => {
                        if(err) {
                            cardReject(err);
                            throw err;
                        }
                        cardResolve(savedCard);
                    });
                }));
            }
            // console.log("Waiting for card promises");
            const cards = await Promise.all(cardPromises);
            await Deck.findByIdAndUpdate(decks[i]._id, {$set: {cards: cards}});
        }
        // console.log("Done adding decks to users' decks arrays and decks to categories and adding cards to decks");

        // console.log("Copying some existing decks into groups");
        // for(const group of groups) {
        // console.log(`groups length: ${groups.length}`);
        // console.log(`decks length: ${decks.length}`);
        for(let i = 0; i < groups.length; i++) {
            // console.log("in groups loop");
            const groupDecks = [];
            // for(const deck of decks) {
            for(let j = 0; j < decks.length; j++) {
                // console.log("in decks loop");
                if(Math.random() < (20 / decks.length)) {
                    const newGroupDeck = new Deck();
                    newGroupDeck.name = decks[j].name;
                    newGroupDeck.creator = decks[j].creator;
                    newGroupDeck.publiclyAvailable = false;
                    const groupDeckCards = [];
                    // for(card of deck.cards) {
                    for(let k = 0; k < decks[j].cards.length; k++) {
                        let card = decks[j].cards[k];
                        let newCard;
                        if(card.__t === 'FlashCard') {
                            newCard = new FlashCard();
                        } else if(card.__t === 'TrueFalseCard') {
                            newCard = new TrueFalseCard();
                            newCard.wrongAnswerOne =  decks[j].cards.wrongAnswerOne;
                        } else if(card.__t === 'MultipleChoiceCard') {
                            newCard = new MultipleChoiceCard();
                            newCard.wrongAnswerOne = decks[j].cards.wrongAnswerOne;
                            newCard.wrongAnswerTwo = decks[j].cards.wrongAnswerTwo;
                            newCard.wrongAnswerThree = decks[j].cards.wrongAnswerThree;
                        }
                        newCard.correctAnswer = decks[j].cards.correctAnswer;
                        newCard.creator = decks[j].cards.creator;
                        newCard.hint = decks[j].cards.hint;
                        await newCard.save();
                        groupDeckCards.push(newCard);
                        decks.splice(j, 1);
                        j--;
                    }
                    newGroupDeck.cards = groupDeckCards;
                    const savedGroupDeck = await newGroupDeck.save();
                    groupDecks.push(savedGroupDeck._id);
                }
            }
            // console.log(`groupID; ${groups[i]._id}`);
            await Group.findByIdAndUpdate(groups[i]._id, {$set: {decks: groupDecks}});
            console.log('updating group decks');
            // decks = decks.filter(deck => !groupDecks.includes(deck._id)); 
            if(Math.random() > .8) console.log(`Decks length is now: ${decks.length}`);
        }
        console.log("Done copying some existing decks into groups");

        console.log("Creating deck attempts");
        
        const finishedUsers = await User.find();
        for(let i = 0; i < finishedUsers.length; i++) {
            if(finishedUsers[i].decks.length) {
                // const randomAttemptNumber = Math.floor(Math.random() * 7);
                const randomAttemptNumber = Math.floor(Math.random() * 40);
                const deckAttemptPromises = [];
                let currentDeckId;//probably delete this
                while(deckAttemptPromises.length < randomAttemptNumber) {
                    //while deckAttempts' length is less than the randomly determined attempt number, fill it with promises that will resolve to fullfilled attempts
                    deckAttemptPromises.push(new Promise((deckAttemptResolve,deckAttemptReject) => {
                        //create a new attempt using the Attempt model
                        let deckAttempt = new DeckAttempt();
                        //for each deckattempt grab a random deck from the user's decks
                        let currentDeckId = finishedUsers[i].decks[Math.floor(Math.random() * finishedUsers[i].decks.length)];
                        //find the randomly selected deck by its id

                        // const discriminators = Card.discriminators;

                        Deck.findById(currentDeckId, async (err, deck) => {
                            deckAttempt.deck = deck._id;
                            // let cards = [];
                            deckAttempt.datePracticed = Date.now();
                            let numCorrect = 0;
                            deckAttempt.cards = [];
                            for(let j = 0; j < deck.cards.length; j++) {
                                let foundCard = await Card.findById(deck.cards[j]);
                                let fullCard = {};

                                switch(foundCard.cardType) {
                                    case "FlashCard":
                                        fullCard = await FlashCard.findById(deck.cards[j]);
                                        break;
                                    case "TrueFalseCard":
                                        fullCard = await TrueFalseCard.findById(deck.cards[j]);
                                        break;
                                    case "MultipleChoiceCard":
                                        fullCard = await MultipleChoiceCard.findById(deck.cards[j]);
                                        break;
                                    default:
                                        // fullCard = {};
                                        break;
                                }
                                let answeredCorrectly = Math.random() > .25;
                                if(answeredCorrectly) {
                                    numCorrect++;
                                }
                                let cardAttempt = new CardAttempt({
                                    cardType: fullCard.cardtype,
                                    question: fullCard.question,
                                    correctAnswer: fullCard.correctAnswer,
                                    answeredCorrectly,
                                    wrongAnswerSelected: answeredCorrectly ? "" : foundCard.cardType === "FlashCard" ? "" : foundCard.cardType === "TrueFalseCard" ? fullCard.wrongAnswerOne : [fullCard.wrongAnswerOne, fullCard.wrongAnswerTwo, fullCard.wrongAnswerTwo][Math.floor(Math.random() * 3)]

                                });
                                const savedCardAttempt = await cardAttempt.save();
                                await Card.findByIdAndUpdate(fullCard._id, {$push: {attempts: cardAttempt}});
                                deckAttempt.cards.push(savedCardAttempt);
                            }
                            deckAttempt.accuracyRate = Math.round((numCorrect / deck.cards.length) * 100);
                            const savedDeckAttempt = await deckAttempt.save();
                            // await User.findByIdAndUpdate(users[i]._id, {$push: {attempts: newAttempt}});
                            deckAttemptResolve(savedDeckAttempt);
                        });
                    }));
                }



                const deckAttempts =  await Promise.all(deckAttemptPromises);
                await User.findByIdAndUpdate(users[i]._id, {$push: {deckAttempts: {$each: deckAttempts}}});
                for(let z = 0; z < deckAttempts.length; z++) {
                    await Deck.findByIdAndUpdate(deckAttempts[z].deck, {$push: {attempts: deckAttempts[z]}});
                }
                if(i === users.length - 1) {
                    console.log("done");
                }
            }
        }

    } catch (err) {
        throw err;
    }
    
});

app.use(router);


app.listen(port, () => {
    console.log(`Node.js listening on port ${port}`);
});