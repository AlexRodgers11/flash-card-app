import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import { dirname, join }from "path";
import { fileURLToPath } from "url";
import { baseRateLimiter, excludingPaths } from "./utils.js";

const port = process.env.port || 8000;
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

// mongoose.connect("mongodb://localhost/flash-card-app-two", {
//     //use MongoDB's new connection string parser instead of the old deprecated one
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
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

app.use(express.static(join(dirname(fileURLToPath(import.meta.url)), "../client/build")));

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