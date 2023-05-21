import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Deck = new Schema({
    name: String,
    publiclyAvailable: Boolean,
    creator: {type: Schema.Types.ObjectId, ref: "User"},
    attempts: [{type: Schema.Types.ObjectId, ref: "DeckAttempt"}],
    cards: [{type: Schema.Types.ObjectId, ref: "Card"}],
    category: {type: Schema.Types.ObjectId, ref: "Category"},
    groupDeckBelongsTo: {type: Schema.Types.ObjectId, ref: "Group"},
    approvedByGroupAdmins: Boolean,
    allowCopies: Boolean,
    deckCopiedFrom: {type: Schema.Types.ObjectId, ref: "Deck"}
}, {timestamps: true});

export default mongoose.model("Deck", Deck);