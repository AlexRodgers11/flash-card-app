const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Attempt = new Schema({
    user: {type: Schema.Types.ObjectId, ref: "user"},
    deck: {type: Schema.Types.ObjectId, ref: "deck"},
    datePracticed: Date,
    cards: [{
        question: String,
        answer: String,
        answeredCorrectly: Boolean
    }]
});

module.exports = mongoose.model("attempt", Attempt);