import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Card = new Schema({
    creator: {type: Schema.Types.ObjectId, ref: "user"},
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
}, {timestamps: true});

export default mongoose.model("card", Card);