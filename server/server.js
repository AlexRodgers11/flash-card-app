import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import faker from "faker";
import Attempt from "./models/attempt.js";
import { FlashCard, MultipleChoiceCard, TrueFalseCard } from "./models/card.js";
import Category from "./models/category.js";
import Deck from "./models/deck.js";
import Group from "./models/group.js";
import User from "./models/user.js";
import Activity from "./models/activity.js";
import getRandomCardType, { generateCode, getRandomJoinOptions } from "./utils.js";
const port = process.env.port || 8000;
const router = express.Router();

import activityRouter from "./routes/activity.js";
import cardRouter from "./routes/cards.js";
import categoryRouter from "./routes/categories.js";
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

mongoose.connect("mongodb://localhost/flash-card-app-four", {
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
        "Origin, X-Requested-With, Content-Type, Accept"
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

// passport.use(
//     "login",
//     new LocalStrategy(
//         {
//             usernameField: "usernameOrEmail",
//             passwordField: "password"
//         },
//         (usernameOrEmail, password, done) => {
//         console.log("finding user");
//         return User.find({
//             $and: [
//                 {$or: [
//                     {"login.username": usernameOrEmail},
//                     {"email": usernameOrEmail}
//                 ]},
//                 {"login.password": password}
//             ]
//         }, (err, user) => {
//             if(err) {
//                 console.error(err);
//                 throw err;
//             }
//             if(user) {
//                 console.log("user found");
//                 return done(null, user);
//             } else {
//                 return done(null, false);
//             }
//         })
//     })
// );

// const jwtOptions = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrKey: "kacchan"
// }

// passport.use(
//     "jwt",
//     new JwtStrategy(jwtOptions, (payload, done) => {
//         console.log("in jwt strategy creation");
//         return done(null, {});
//     })
// );

// const requireSignIn = passport.authenticate("login", {session: false});

// const tokenForUser = user => {
//     console.log("creating token for user");
//     return jwt.encode({
//         sub: user._id,
//         iat: Math.round(Date.now() / 1000),
//         //expire after 2 hours
//         exp: Math.round(Date.now() / 1000 + 2 * 60 * 60)
//     },
//     "theblackswordsman");
// }
// app.post("/login", requireSignIn, (req, res, next) => {
//     console.log("POST request received");
//     res.send({
//         token: tokenForUser(req.user)
//     });
// });

app.use("/activities", activityRouter);
app.use("/cards", cardRouter);
app.use("/categories", categoryRouter);
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

//create array of users
//create array of groups
//add users to groups
//set group creator and admins
//create activity

//seed database

router.get("/seed-database", async(req, res, next) => {
    try {
        console.log("Creating users");
        const userPromises = [];
        while (userPromises.length < 4000) {
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
        while(groupPromises.length < 1000) {
            groupPromises.push(new Promise((groupResolve, groupReject) => {
                let newGroup = new Group();
                newGroup.name = faker.random.word() + Math.ceil(Math.random() * 100);
                newGroup.decks = [];
                let joinMethodPicker = Math.random();
                // newGroup.allowJoinWithCode = joinMethodPicker >= .66666 || joinMethodPicker < .33333;
                // newGroup.joinCode = newGroup.allowJoinWithCode ? generateJoinCode() : '';
                // newGroup.allowJoinRequests = joinMethodPicker < .66666;
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

        // console.log("Adding groups to members' groups array");
        // for(let i = 0; i < groups.length; i++) {
        //     for(let j = 0; j < users.length; j++) {
        //         if(Math.random() > .87) {
        //             await User.findByIdAndUpdate(users[j]._id, {$addToSet: {groups: groups[i]._id}});
        //         }
        //     }
        // }
        // console.log("Done adding groups to members' groups array");

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
        while(categoryPromises.length < 75) {
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
        let randomDeckNumber = 30000;

        while(deckPromises.length < randomDeckNumber) {
            deckPromises.push(new Promise((deckResolve, deckReject) => {
                let newDeck = new Deck();
                    newDeck.name = faker.hacker.adjective();
                    newDeck.publiclyAvailable = Math.random() > .7 ? true : false;
                    let randomNum = Math.floor(Math.random() * users.length);
                    // console.log(`user array length: ${users.length}`);
                    // console.log(randomNum);
                    // console.log(users[randomNum]);
                    // let randomUserId = users[Math.floor(Math.random() * users.length)]._id;
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
            let randomCardNumber = 3 + Math.ceil(Math.random() * 15);
            const cardPromises = [];
            // console.log("creating cards");
            while(cardPromises.length < randomCardNumber) {
                cardPromises.push(new Promise((cardResolve, cardReject) => {
                    let cardTypeDecider = Math.random();
                    let newCard;
                    if(cardTypeDecider <= .3333) {
                        newCard = new FlashCard();
                        newCard.correctAnswer = Math.random() > .5 ? faker.hacker.noun() : faker.hacker.phrase();
                    } else if(cardTypeDecider <= .6666) {
                        newCard = new TrueFalseCard();
                        newCard.correctAnswer = Math.random() > .5 ? "True" : "False";
                        newCard.wrongAnswerOne = newCard.correctAnswer === "True" ? "False" : "True";
                    } else {
                        newCard = new MultipleChoiceCard();
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
                        newCard.stats = {
                            numberCorrect: 0,
                            numberIncorred: 0
                        }
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

        // users.forEach(async user => {
        //     //if user has at least one deck then create some attempts
        //     console.log(user.decks.length);
        //     if(user.decks.length) {
        //         console.log("updating user attempts");
        //         //decide how many attempts this user will make
        //         let randomAttemptNumber = Math.floor(Math.random() * 10);
        //         console.log({randomAttemptNumber});
        //         let attempts = [];
        //         while(attempts.length < randomAttemptNumber) {
        //             //while attempts' length is less than the randomly determined attempt number, fill it with promises that will resolve to fullfilled attempts
        //             attempts.push(new Promise((resolve, reject) => {
        //                 console.log("inside attempt Promise");
        //                 //create a new attempt using the Attempt model
        //                 let attempt = new Attempt();
        //                 //for each attempt grab a random deck from the user's decks
        //                 let randomDeckId = user.decks[Math.floor(Math.random() * user.decks.length)];
        //                 console.log(`Num decks: ${user.decks.length}, randomDeckId: ${randomDeckId}`);
        //                 //find the randomly selected deck by its id
        //                 Deck.findById(randomDeckId)
        //                     //populate the cards array of the found deck
        //                     .populate({path: "cards", model: "card"})
        //                     .exec((err, deck) => {
        //                         if(deck.cards.length) {
        //                             attempt.cards = deck.cards.map(card => {
        //                                 let cardAttempt = {
        //                                     question: card.question,
        //                                     answer: card.correctAnswer,
        //                                     answeredCorrectly: Math.random() > .25
        //                                 }
        //                                 return cardAttempt;
        //                             });
        //                         } else {
        //                             attempt.cards = [];
        //                         }
        //                         attempt.user = user._id;
        //                         attempt.deck = deck._id;
        //                         // attempt.datePracticed = Date.now();
        //                         attempt.save((err, attempt) => {
        //                             if(err) {
        //                                 throw err;
        //                             } else {
        //                                 User.findByIdAndUpdate(user._id, {$push: {attempts: attempt}}, (err, user) => {
        //                                     console.log("updating user");
        //                                     if(err) {
        //                                         throw err;
        //                                     } else {
        //                                         resolve(attempt);
        //                                     }
        //                                 });
        //                             }
        //                         })
        //                 });
        //             }));
        //         }
        //         await Promise.all(attempts).then(() => {
        //             console.log("in promise finish");
        //             User.findByIdAndUpdate(user._id, {$push: {attempts: {$each: attempts}}});
        //         });
        //     }
            
        // });
        // res.status(200).send("done");

        // for(const user of users) {
        
        const finishedUsers = await User.find();
        // console.log(`users length: ${finishedUsers.length}`);
        // console.log(finishedUsers[10]);
        // console.log(finishedUsers[10].decks);
        // console.log(finishedUsers[10].decks.length);
        for(let i = 0; i < finishedUsers.length; i++) {
            if(finishedUsers[i].decks.length) {
                const randomAttemptNumber = Math.floor(Math.random() * 10);
                const attemptPromises = [];
                while(attemptPromises.length < randomAttemptNumber) {
                    //while attempts' length is less than the randomly determined attempt number, fill it with promises that will resolve to fullfilled attempts
                    attemptPromises.push(new Promise((attemptResolve, attemptReject) => {
                        //create a new attempt using the Attempt model
                        let attempt = new Attempt();
                        //for each attempt grab a random deck from the user's decks
                        let randomDeckId = finishedUsers[i].decks[Math.floor(Math.random() * finishedUsers[i].decks.length)];
                        // console.log(`Num decks: ${finishedUsers[i].decks.length}, randomDeckId: ${randomDeckId}`);
                        //find the randomly selected deck by its id
                        
                        Deck.findById(randomDeckId)
                            //populate the cards array of the found deck
                            .populate({path: "cards", model: "Card"})
                            // .exec((err, deck) => {
                            .then((deck) => {
                                if(deck.cards.length) {
                                    attempt.cards = deck.cards.map(card => {
                                        let cardAttempt = {
                                            question: card.question,
                                            answer: card.correctAnswer,
                                            answeredCorrectly: Math.random() > .25
                                        }
                                        return cardAttempt;
                                    });
                                } else {
                                    attempt.cards = [];
                                }
                                attempt.user = finishedUsers[i]._id;
                                attempt.deck = deck._id;
                                // attempt.datePracticed = Date.now();
                                attempt.save((err, attempt) => {
                                    if(err) {
                                        throw err;
                                    } else {
                                        User.findByIdAndUpdate(users[i]._id, {$push: {attempts: attempt}}, (err, user) => {
                                            // console.log("updating user");
                                            if(err) {
                                                throw err;
                                            } else {
                                                attemptResolve(attempt);
                                            }
                                        });
                                    }
                                })
                        });
                    }));
                }
                const attempts =  await Promise.all(attemptPromises);
                User.findByIdAndUpdate(users[i]._id, {$push: {attempts: {$each: attempts}}});
            }
        }

    } catch (err) {
        throw err;
    }
    
});

// seed database
// router.get("/seed-database", async (req, res, next) => {
//     //seed users
//     const users = [];
//     while(users.length < 750) {
//         // let userPromise = new Promise((userResolve, userReject) => {
//         //     let user = new User();
//         //     user.login.username = faker.random.word() + faker.random.word();
//         //     user.login.password = faker.hacker.phrase().replace(/\s/g, "") + Math.ceil(Math.random() * 100);
//         //     let names = faker.name.findName().split(" ");
//         //     user.name.first = names[0];
//         //     user.name.last = names[1];
//         //     user.email = faker.internet.email();
//         //     user.photo = faker.image.people();
//         //     await user.save()
//         // });
//         users.push(new Promise((resolve, reject) => {
//             let user = new User();
//             user.login.username = faker.random.word() + faker.random.word();
//             user.login.password = faker.hacker.phrase().replace(/\s/g, "") + Math.ceil(Math.random() * 100);
//             let names = faker.name.findName().split(" ");
//             user.name.first = names[0];
//             user.name.last = names[1];
//             user.email = faker.internet.email();
//             user.photo = faker.image.people();
//             user.save((err, user) => {
//                 if(err) {
//                     throw err;
//                 }
//                 resolve(user);
//             });
//         }));        
//         // users.push(new Promise((resolve, reject) => {
//         //     let user = new User();
//         //     user.login.username = faker.random.word() + faker.random.word();
//         //     user.login.password = faker.hacker.phrase().replace(/\s/g, "") + Math.ceil(Math.random() * 100);
//         //     let names = faker.name.findName().split(" ");
//         //     user.name.first = names[0];
//         //     user.name.last = names[1];
//         //     user.email = faker.internet.email();
//         //     user.photo = faker.image.people();
//         //     user.save((err, user) => {
//         //         if(err) {
//         //             throw err;
//         //         }
//         //         resolve(user);
//         //     });
//         // }));        
//     }
//     await Promise.all(users);

//     //seed groups
//     const groups = [];
//     while(groups.length < 100) {
//         groups.push(new Promise((userResolve, userReject) => {
//             let group = new Group();
//             group.name = faker.random.word() + Math.ceil(Math.random() * 100);
//             group.decks = [];
//             group.joinCode = Math.random() > .5 ? faker.random.word() : ''
//             users.forEach(user => {
//                 if(Math.random() > .90) {
//                     group.members.push(user._id);
//                 }
//             });
            
//             if(group.members.length < 1) {
//                 group.members.push(users[0]);
//             }
//             group.creator = group.members[0];
//             if(group.members.length > 5) {
//                 group.administrators = group.members.slice(0,3);
//             } else {
//                 group.administrators = [group.creator];
//             }
//             let activity = new Activity();
//             activity.actor = group.creator._id;
//             activity.type = 'create-group';
//             activity.content = '';
//             activity.groupTarget = group._id;
//             // const savedActivity = await activity.save();
//             activity.save((err, activity) => {
//                 if(err) {
//                     res.status(500).send("There was an error with your request");
//                     throw err;
//                 }
//                 group.activity = [activity._id];
//                 group.save((err, group) => {
//                     if(err) {
//                         throw err;
//                     }
//                     let usersPromise = User.updateMany({_id: {$in: group.members}}, {$push: {groups: group._id}});
//                     usersPromise.catch(err => {throw err}).then(() => {
//                         userResolve(group);
//                     });
//                 });
//             });
//         }));
//     }
//     await Promise.all(groups);
//     console.log("Done creating groups");

//     console.log("Creating categories");
//     const categories = [];
//     while(categories.length < 75) {
//         categories.push(new Promise((categoryResolve, categoryReject) => {
//             let newCategory = new Category();
//             newCategory.name = faker.hacker.noun() + faker.hacker.adjective() + faker.hacker.verb();
//             newCategory.save((err, category) => {
//                 if(err) {
//                     res.status(500).send("There was an error creating categories");
//                     throw err;
//                 }
//                 categoryResolve(category)
//             });
//         }));
//     }
//     await Promise.all(categories);
//     console.log("Done creating categories");
    
//     console.log("Creating decks");
//     const decks = [];
//     let randomDeckNumber = 3000 + Math.ceil(Math.random() * 4000);

//     while(decks.length < randomDeckNumber) {
//         decks.push(new Promise((deckResolve, deckReject) => {}));
//     }
// });


// seed database with starter data
// router.get("/seed-database", (req, res, next) => {
//     console.log("Seeding database");
    
//     console.log("creating users");
//     let users = [];
//     //create users
//     while(users.length < 750) {
//         users.push(new Promise((resolve, reject) => {
//             let user = new User();
//             user.login.username = faker.random.word() + faker.random.word();
//             user.login.password = faker.hacker.phrase().replace(/\s/g, "") + Math.ceil(Math.random() * 100);
//             let names = faker.name.findName().split(" ");
//             user.name.first = names[0];
//             user.name.last = names[1];
//             user.email = faker.internet.email();
//             user.photo = faker.image.people();
//             user.save((err, user) => {
//                 if(err) {
//                     throw err;
//                 }
//                 resolve(user);
//             });
//         }));        
//     }

//     Promise.all(users).then((users) => {
//         console.log("Creating groups");
//         let groups = [];
//         //create groups
//         while(groups.length < 100) {
//             groups.push(new Promise((resolve, reject) => {
//                 let group = new Group();
//                 group.name = faker.random.word() + Math.ceil(Math.random() * 100);
//                 group.decks = [];
//                 group.joinCode = Math.random() > .5 ? faker.random.word() : ''
//                 users.forEach(user => {
//                     if(Math.random() > .90) {
//                         group.members.push(user._id);
//                     }
//                 });
                
//                 if(group.members.length < 1) {
//                     group.members.push(users[0]);
//                 }
//                 group.creator = group.members[0];
//                 if(group.members.length > 5) {
//                     group.administrators = group.members.slice(0,3);
//                 } else {
//                     group.administrators = [group.creator];
//                 }
//                 let createActivity = new Activity();
//                 // createActivity.date = Date.now();
//                 createActivity.actor = group.creator._id;
//                 createActivity.type = 'create-group';
//                 createActivity.content = '';
//                 createActivity.groupTarget = group._id;
//                 createActivity.save((err, activity) => {
//                     if(err) console.log(err);
//                     group.activity = [activity._id];
//                     group.save((err, group) => {
//                         if(err) {
//                             throw err;
//                         }
//                         let usersPromise = User.updateMany({_id: {$in: group.members}}, {$push: {groups: group._id}});
//                         usersPromise.catch(err => {throw err}).then(() => {
//                             resolve(group);
//                         });
//                     });
//                 })
                
//             }));
//         };
//         console.log("Done creating groups");

//         Promise.all(groups).then((groups) => {
//             let categories = [];
//             console.log("creating categories");

//             while(categories.length < 75) {
//                 categories.push(new Promise((categoryResolve, categoryReject) => {
//                     let category = new Category();
//                     category.name = faker.hacker.noun() + faker.hacker.adjective() + faker.hacker.verb();
//                     category.save((err, category) => {
//                         if(err) {
//                             throw err;
//                         } else {
//                             categoryResolve(category);
//                         }
//                     })
//                 }));
//             }
//             Promise.all(categories).then((categories) => {
//                 console.log("Creating decks");
//                 let decks = [];
//                 let randomDeckNumber = 3000 + Math.ceil(Math.random() * 4000);
                
//                 while(decks.length < randomDeckNumber) {
//                     decks.push(new Promise((resolve, reject) => {
//                         let deck = new Deck();
//                         deck.name = faker.hacker.adjective();
//                         deck.publiclyAvailable = Math.random() > .7 ? true : false;
//                         deck.creator = users[Math.floor(Math.random() * users.length)]._id;
//                         // deck.dateCreated = Date.now();
//                         // console.log("Beginning to create cards");
//                         let cards = [];
//                         let randomCardNumber = 3 + Math.ceil(Math.random() * 30);
//                         let deckAttemptCount = Math.floor(Math.random() * 20);
//                         while(cards.length < randomCardNumber) {
//                             cards.push(new Promise((reso, reje) => {
//                                 let card = new Card();
//                                 card.creator = deck.creator;

//                                 card.type = getRandomCardType(Math.random());
//                                 card.question = faker.hacker.phrase();
//                                 if(card.type === "multiple-choice") {
//                                     let randomNum = Math.random();
//                                     card.correctAnswer = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
//                                     card.wrongAnswerOne = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
//                                     card.wrongAnswerTwo = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
//                                     card.wrongAnswerThree = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
//                                 } else if(card.type === "true-false") {
//                                     card.correctAnswer = Math.random() > .5 ? "True" : "False";
//                                     card.wrongAnswerOne = card.correctAnswer === "True" ? "False" : "True";
//                                 } else {
//                                     card.correctAnswer = Math.random() > .5 ? faker.hacker.noun() : faker.hacker.phrase();
//                                 }
//                                 if(Math.random > .7) {
//                                     faker.hint = faker.hacker.phrase();
//                                 }
//                                 card.stats.numberCorrect = deckAttemptCount - Math.floor(Math.random() * deckAttemptCount);
//                                 card.stats.numberIncorrect = deckAttemptCount - card.stats.numberCorrect;
//                                 card.save((err, card) => {
//                                     if(err) {
//                                         throw err;
//                                     } 
//                                     deck.cards.push(card);
//                                     reso(card);
//                                 });
//                             }));
//                         }
//                         // console.log("Done creating cards");
//                         Promise.all(cards).then((cards) => {
//                             // console.log("cards finished loading");
//                             // console.log(cards);
//                             deck.cards = cards;
//                             let randomViewStartIndex = Math.floor(Math.random() * (users.length - 1));
//                             let randomViewStopIndex = randomViewStartIndex + Math.ceil(Math.random() * (users.length - randomViewStartIndex));
//                             let randomGroupIndex = Math.floor(Math.random() * groups.length);
//                             let inGroup = Math.random() > .7;
//                             deck.permissions.view = inGroup ? groups[randomGroupIndex].members.map(user => user._id) : users.slice(randomViewStartIndex, randomViewStopIndex).map(user => user._id);
//                             if(deck.permissions.view.indexOf(deck.creator._id) === -1) {
//                                 deck.permissions.view.unshift(deck.creator._id);
//                             }
//                             let randomEditStartIndex = Math.floor(Math.random() * (deck.permissions.view.length - 1));
//                             let randomEditStopIndex = randomEditStartIndex + Math.ceil(Math.random() * (deck.permissions.view.length - randomEditStartIndex));
//                             deck.permissions.edit = deck.permissions.view.slice(randomEditStartIndex, randomEditStopIndex);
//                             if(deck.permissions.view.indexOf(deck.creator._id) === -1) {
//                                 deck.permissions.edit.unshift(deck.creator._id);
//                             }
//                             deck.permissions.copy = (deck.permissions.view.length > 0 || deck.public) && Math.random() > .7 ? true : false;
//                             deck.permissions.suggest = (deck.permissions.view.length > 0 || deck.public) && Math.random() > .3 ? true : false;
//                             let deckPromise = deck.save((err, deck) => {
//                                 if(err) {
//                                     throw err;
//                                 }
//                                 if(inGroup) {
//                                     let randomMemberIndex = Math.floor(Math.random() * groups[randomGroupIndex].members.length)
//                                     let addDeckActivity = new Activity({
//                                         // date: Date.now(),
//                                         actor: groups[randomGroupIndex].members[randomMemberIndex],
//                                         type: 'add-deck',
//                                         content: '',
//                                         groupTarget: groups[randomGroupIndex]._id,
//                                         deckTarget: deck._id
//                                     });
//                                     addDeckActivity.save((err, activity) => {
//                                         if(err) {
//                                             console.error(err);
//                                             throw err;
//                                         } else {
//                                             // let groupPromise = Group.findByIdAndUpdate(groups[randomGroupIndex]._id, {$push: {decks: deck._id}, $push: {activity: activity._id}})
//                                             let groupPromise = Group.findByIdAndUpdate(groups[randomGroupIndex]._id, {$push: {decks: deck._id, activity: activity._id}});
//                                             groupPromise.catch(err => {throw err}).then(console.log("done"));
//                                         }
//                                     });                                    
//                                 }
//                                 let userPromise = User.findByIdAndUpdate(deck.creator, {$push: {decks: deck}}).exec();
//                                 userPromise.catch(err => {throw err}).then(() => {
//                                     return deck;
//                                 });
//                                 categories.forEach(category => {
//                                     if(Math.random() > .9) {
//                                         // console.log("deck should be added to a category");
//                                         let categoryPromise = Category.findByIdAndUpdate(category._id, {$push: {decks: deck._id}}).exec();
//                                         categoryPromise.then(() => {
//                                             // console.log("category promise completed")
//                                             return;
//                                         });
//                                     }
//                                 });
//                                 console.log("deck added to one or more categories");
//                             });
//                             resolve(deckPromise);
//                         });
//                     }));
//                 }
//                 Promise.all(decks).then(
//                     res.send("Database seeding complete")
//                 );
//             })
//         });
//     });
// });

app.get("/seed-attempts", (req, res, next) => {
    //get all users
    User.find({}, (err, users) => {
        //loop through each user
        users.forEach(async user => {
            //if user has at least one deck then create some attempts
            if(user.decks.length) {
                //decide how many attempts this user will make
                let randomAttemptNumber = Math.floor(Math.random() * 10);
                let attempts = [];
                while(attempts.length < randomAttemptNumber) {
                    //while attempts' length is less than the randomly determined attempt number, fill it with promises that will resolve to fullfilled attempts
                    attempts.push(new Promise((resolve, reject) => {
                        //create a new attempt using the Attempt model
                        let attempt = new Attempt();
                        //for each attempt grab a random deck from the user's decks
                        let randomDeckId = user.decks[Math.floor(Math.random() * user.decks.length)];
                        // console.log(`Num decks: ${user.decks.length}, randomDeckId: ${randomDeckId}`);
                        //find the randomly selected deck by its id
                        Deck.findById(randomDeckId)
                            //populate the cards array of the found deck
                            .populate({path: "cards", model: "card"})
                            .exec((err, deck) => {
                                if(deck.cards.length) {
                                    attempt.cards = deck.cards.map(card => {
                                        let cardAttempt = {
                                            question: card.question,
                                            answer: card.correctAnswer,
                                            answeredCorrectly: Math.random() > .25
                                        }
                                        return cardAttempt;
                                    });
                                } else {
                                    attempt.cards = [];
                                }
                                attempt.user = user._id;
                                attempt.deck = deck._id;
                                // attempt.datePracticed = Date.now();
                                attempt.save((err, attempt) => {
                                    if(err) {
                                        throw err;
                                    } else {
                                        User.findByIdAndUpdate(user._id, {$push: {attempts: attempt}}, (err, user) => {
                                            // console.log("updating user");
                                            if(err) {
                                                throw err;
                                            } else {
                                                resolve(attempt);
                                            }
                                        });
                                    }
                                })
                        });
                    }));
                }
                await Promise.all(attempts).then(() => {
                    console.log("in promise finish");
                    User.findByIdAndUpdate(user._id, {$push: {attempts: {$each: attempts}}});
                });
            }
            
        });
        res.status(200).send("done");
    });
});


// app.get("/seed-admin-privileges", (req, res, next) => {
//     Group.find({}, (err, groups) => {
//         if(err) {
//             console.error(err);
//             throw err;
//         }
//         groups.forEach(async group => {
//             User.updateMany({_id: {$in: group.administrators}}, {$push: {adminOf: group._id}}).catch(err => {
//                 console.error(err);
//                 throw err;
//             });
//         });
//     });
// })

app.use(router);


app.listen(port, () => {
    console.log(`Node.js listening on port ${port}`);
});