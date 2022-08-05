const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const router = express.Router();
const faker = require("faker");
const port = process.env.port || 8000;
const Attempt = require("./models/attempt");
const Card = require("./models/card");
const Category = require("./models/category");
const Deck = require("./models/deck");
const Group = require("./models/group");
const User = require("./models/user");
const { getRandomCardType } = require("./utils");

const categoryRouter = require("./routes/categories");
const cardRouter = require("./routes/cards");
const deckRouter = require("./routes/decks");
const groupRouter = require("./routes/groups");
const userRouter = require("./routes/users");

mongoose.connect("mongodb://localhost/flash-card-app", {
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
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
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

app.use("/categories", categoryRouter);
app.use("/cards", cardRouter);
app.use("/decks", deckRouter);
app.use("/groups", groupRouter);
app.use("/users", userRouter);

router.get("/test", (req, res, next) => {
    console.log("connected");
    res.status(200).send("connected");
})

// seed database with starter data
router.get("/seed-database", (req, res, next) => {
    console.log("Seeding database");
    
    console.log("creating users");
    let users = [];
    //create users
    while(users.length < 100) {
        users.push(new Promise((resolve, reject) => {
            let user = new User();
            user.login.username = faker.random.word() + faker.random.word();
            user.login.password = faker.hacker.phrase().replace(/\s/g, "") + Math.ceil(Math.random() * 100);
            let names = faker.name.findName().split(" ");
            user.name.first = names[0];
            user.name.last = names[1];
            user.email = faker.internet.email();
            user.photo = faker.image.people();
            user.save((err, user) => {
                if(err) {
                    throw err;
                }
                resolve(user);
            });
        }));        
    }

    Promise.all(users).then((users) => {
        console.log("Creating groups");
        let groups = [];
        //create groups
        while(groups.length < 10) {
            groups.push(new Promise((resolve, reject) => {
                let group = new Group();
                group.name = faker.random.word() + Math.ceil(Math.random() * 100);
                group.decks = [];
                users.forEach(user => {
                    if(Math.random() > .80) {
                        group.members.push(user._id);
                    }
                });
                group.save((err, group) => {
                    if(err) {
                        throw err;
                    }
                    let usersPromise = User.updateMany({_id: {$in: group.members}}, {$push: {groups: group._id}});
                    usersPromise.catch(err => {throw err}).then(() => {
                        resolve(group);
                    });
                });
            }));
        };
        console.log("Done creating groups");

        Promise.all(groups).then((groups) => {
            let categories = [];
            console.log("creating categories");

            while(categories.length < 75) {
                categories.push(new Promise((categoryResolve, categoryReject) => {
                    let category = new Category();
                    category.name = faker.hacker.noun() + faker.hacker.adjective() + faker.hacker.verb();
                    category.save((err, category) => {
                        if(err) {
                            throw err;
                        } else {
                            categoryResolve(category);
                        }
                    })
                }));
            }
            Promise.all(categories).then((categories) => {
                console.log("Creating decks");
                let decks = [];
                let randomDeckNumber = 50 + Math.ceil(Math.random() * 250);
                
                while(decks.length < randomDeckNumber) {
                    decks.push(new Promise((resolve, reject) => {
                        let deck = new Deck();
                        deck.name = faker.hacker.adjective();
                        deck.public = Math.random() > .7 ? true : false;
                        deck.creator = users[Math.floor(Math.random() * users.length)]._id;
                        deck.dateCreated = Date.now();
                        // console.log("Beginning to create cards");
                        let cards = [];
                        let randomCardNumber = 5 + Math.ceil(Math.random() * 50);
                        let deckAttemptCount = Math.floor(Math.random() * 20);
                        while(cards.length < randomCardNumber) {
                            cards.push(new Promise((reso, reje) => {
                                let card = new Card();
                                card.creator = deck.creator;
                                card.dateCreated = Date.now();
                                card.type = getRandomCardType(Math.random());
                                card.question = faker.hacker.phrase();
                                if(card.type === "multiple-choice") {
                                    let randomNum = Math.random();
                                    card.correctAnswer = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
                                    card.wrongAnswerOne = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
                                    card.wrongAnswerTwo = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
                                    card.wrongAnswerThree = randomNum > .2 ? faker.hacker.noun() : faker.hacker.phrase();
                                } else if(card.type === "true-false") {
                                    card.correctAnswer = Math.random() > .5 ? "True" : "False";
                                    card.wrongAnswerOne = card.correctAnswer === "True" ? "False" : "True";
                                } else {
                                    card.correctAnswer = Math.random() > .5 ? faker.hacker.noun() : faker.hacker.phrase();
                                }
                                if(Math.random > .7) {
                                    faker.hint = faker.hacker.phrase();
                                }
                                card.stats.numberCorrect = deckAttemptCount - Math.floor(Math.random() * deckAttemptCount);
                                card.stats.numberIncorrect = deckAttemptCount - card.stats.numberCorrect;
                                card.save((err, card) => {
                                    if(err) {
                                        throw err;
                                    } 
                                    deck.cards.push(card);
                                    reso(card);
                                });
                            }));
                        }
                        // console.log("Done creating cards");
                        Promise.all(cards).then((cards) => {
                            // console.log("cards finished loading");
                            // console.log(cards);
                            deck.cards = cards;
                            let randomViewStartIndex = Math.floor(Math.random() * (users.length - 1));
                            let randomViewStopIndex = randomViewStartIndex + Math.ceil(Math.random() * (users.length - randomViewStartIndex));
                            let randomGroupIndex = Math.floor(Math.random() * groups.length);
                            let inGroup = Math.random() > .7;
                            deck.permissions.view = inGroup ? groups[randomGroupIndex].members.map(user => user._id) : users.slice(randomViewStartIndex, randomViewStopIndex).map(user => user._id);
                            if(deck.permissions.view.indexOf(deck.creator._id) === -1) {
                                deck.permissions.view.unshift(deck.creator._id);
                            }
                            let randomEditStartIndex = Math.floor(Math.random() * (deck.permissions.view.length - 1));
                            let randomEditStopIndex = randomEditStartIndex + Math.ceil(Math.random() * (deck.permissions.view.length - randomEditStartIndex));
                            deck.permissions.edit = deck.permissions.view.slice(randomEditStartIndex, randomEditStopIndex);
                            if(deck.permissions.view.indexOf(deck.creator._id) === -1) {
                                deck.permissions.edit.unshift(deck.creator._id);
                            }
                            deck.permissions.copy = (deck.permissions.view.length > 0 || deck.public) && Math.random() > .7 ? true : false;
                            deck.permissions.suggest = (deck.permissions.view.length > 0 || deck.public) && Math.random() > .3 ? true : false;
                            let deckPromise = deck.save((err, deck) => {
                                if(err) {
                                    throw err;
                                }
                                if(inGroup) {
                                    let groupPromise = Group.findByIdAndUpdate(groups[randomGroupIndex]._id, {$push: {decks: deck._id}});
                                    groupPromise.catch(err => {throw err}).then(console.log("done"));
                                }
                                let userPromise = User.findByIdAndUpdate(deck.creator, {$push: {decks: deck}}).exec();
                                userPromise.catch(err => {throw err}).then(() => {
                                    return deck;
                                });
                                categories.forEach(category => {
                                    if(Math.random() > .9) {
                                        // console.log("deck should be added to a category");
                                        let categoryPromise = Category.findByIdAndUpdate(category._id, {$push: {decks: deck._id}}).exec();
                                        categoryPromise.then(() => {
                                            // console.log("category promise completed")
                                            return;
                                        });
                                    }
                                });
                                console.log("deck added to one or more categories");
                            });
                            resolve(deckPromise);
                        });
                    }));
                }
                Promise.all(decks).then(
                    res.send("Database seeding complete")
                );
            })
        });
    });
});

app.use(router);


app.listen(port, () => {
    console.log(`Node.js listening on port ${port}`);
});