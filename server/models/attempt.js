import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Attempt = new Schema({
    deck: {type: Schema.Types.ObjectId, ref: "Deck"},
    datePracticed: Date,
    accuracyRate: Number,
    cards: [{type: Schema.Types.ObjectId, ref: "CardAttempt"}]
}, {timestamps: true});

const attemptModel = mongoose.model("Attempt", Attempt);
export default attemptModel;