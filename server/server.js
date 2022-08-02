const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const router = express.Router();
const faker = require("faker");
const port = process.env.PORt || 8000;
const Attempt = require("./models/attempt");
const Card = require("./models/card");
const Category = require("./models/category");
const Deck = require("./models/deck");
const Group = require("./models/group");
const User = require("./models/user");

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

app.listen(port, () => {
    console.log(`Node.js listening on port ${port}`);
});