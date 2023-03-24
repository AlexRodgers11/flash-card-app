import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { baseRateLimiter, excludingPaths } from "./utils.js";

const port = process.env.PORT || 8000;
const router = express.Router();

import deckAttemptRouter from "./routes/deckAttempts.js";
import cardAttemptRouter from "./routes/cardAttempts.js";
import cardRouter from "./routes/cards.js";
import categoryRouter from "./routes/categories.js";
import communicationRouter from "./routes/communications.js";
import deckRouter from "./routes/decks.js";
import groupRouter from "./routes/groups.js";
import loginRouter from "./routes/login.js";
import messageRouter from "./routes/message.js";
import notificationRouter from "./routes/notification.js";
import userRouter from "./routes/users.js"

import passport from "passport";

import dotenv from "dotenv";

dotenv.config();
console.log("CLIENT_ORIGIN:", process.env.CLIENT_ORIGIN);
console.log("PORT:", process.env.PORT);

const database = async () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true    
    }

    try {
        mongoose.connect(process.env.MONGODB_CONNECTION_STRING, connectionParams);
        console.log("Database connected succesfully");
    } catch (err) {
        console.error(err.message);
    }
}



const app = express();

//use body-parsing middleware that only parses json
app.use(bodyParser.json());


//set response headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN || "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, PATCH, PUT, POST, DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

//use url-encoding middleware that allows for a wider array of data to be encoded
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(cookieParser());

app.use(passport.initialize());

app.use(excludingPaths([/\/decks\/([0-9A-Za-z]+([A-Za-z]+[0-9A-Za-z]+)+)\/tile/i, /\/users\/([0-9A-Za-z]+([A-Za-z]+[0-9A-Za-z]+)+)\/tile/i], baseRateLimiter));

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

app.use(router);


app.listen(port, () => {
    console.log(`Node.js listening on port ${port}`);
});

if(process.env.NODE_ENV === "development") {
    mongoose.connect("mongodb://localhost/flash-card-app-one", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
} else {
    database();
}