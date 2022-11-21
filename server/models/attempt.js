import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Attempt = new Schema({
    deck: {type: Schema.Types.ObjectId, ref: "Deck"},
    datePracticed: Date,
    accuracyRate: Number,
    cards: [{
        cardId: String,
        question: String,
        correctAnswer: String,
        answeredCorrectly: Boolean,
        wrongAnswerSelected: String
    }]
}, {timestamps: true});

const attemptModel = mongoose.model("Attempt", Attempt);
export default attemptModel;