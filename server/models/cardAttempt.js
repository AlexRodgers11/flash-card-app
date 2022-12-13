import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CardAttempt = new Schema({
    datePracticed: Date,
    cardType: String,
    question: String,
    correctAnswer: String,
    answeredCorrectly: Boolean,
    wrongAnswerSelected: String
}, {timestamps: true});

const cardAttemptModel = mongoose.model("CardAttempt", CardAttempt);
export default cardAttemptModel;