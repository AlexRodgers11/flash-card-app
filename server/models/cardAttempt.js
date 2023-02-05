import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CardAttempt = new Schema({
    datePracticed: Date,
    cardType: String,
    question: String,
    correctAnswer: String,
    answeredCorrectly: Boolean,
    wrongAnswerSelected: String,
    attempter: {type: Schema.Types.ObjectId, ref: "User"},
    groupAttemptBelongsTo: {type: Schema.Types.ObjectId, ref: "Group"}
}, {timestamps: true});

const cardAttemptModel = mongoose.model("CardAttempt", CardAttempt);
export default cardAttemptModel;