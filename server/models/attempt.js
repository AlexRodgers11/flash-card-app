import mongoose from "mongoose";

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

const attemptModel = mongoose.model("attempt", Attempt);
export default attemptModel;