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
    photo: String,
    groups: [{type: Schema.Types.ObjectId, ref: "group"}]
});

module.exports = mongoose.model("user", User);