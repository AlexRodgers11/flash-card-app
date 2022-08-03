const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = new Schema({
    login: {
        username: String,
        password: String
    },
    name: {
        first: String,
        last: String
    },
    email: String,
    photo: String
});

module.exports = mongoose.model("user", User);