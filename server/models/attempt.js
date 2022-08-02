const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Attempt = new Schema({
    datePracticed: Date,
    numberCorrect: Number,
    numberIncorrect: Number
});

module.exports = mongoose.model("attempt", Attempt);