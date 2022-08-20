import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Card = new Schema({
    creator: {type: Schema.Types.ObjectId, ref: "user"},
    dateCreated: Date,
    type: String,
    question: String,
    correctAnswer: String,
    wrongAnswerOne: String,
    wrongAnswerTwo: String,
    wrongAnswerThree: String,
    hint: String,
    stats: {
        numberCorrect: Number,
        numberIncorrect: Number
    }
});

export default mongoose.model("card", Card);