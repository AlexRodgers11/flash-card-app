import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DeckAttempt = new Schema({
    deck: {type: Schema.Types.ObjectId, ref: "Deck"},
    datePracticed: Date,
    accuracyRate: Number,
    cards: [{type: Schema.Types.ObjectId, ref: "CardAttempt"}]
}, {timestamps: true});

const deckAttemptModel = mongoose.model("DeckAttempt", DeckAttempt);
export default deckAttemptModel;