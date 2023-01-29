import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Deck = new Schema({
    name: String,
    publiclyAvailable: Boolean,
    creator: {type: Schema.Types.ObjectId, ref: "User"},
    attempts: [{type: Schema.Types.ObjectId, ref: "DeckAttempt"}],
    cards: [{type: Schema.Types.ObjectId, ref: "Card"}],
    //didn't have this because when retrieving decks of a category can just search that category. The problem is if I want to display on the deck what categories it belongs to have to search ALL categories for ALL decks, which would be too long
    categories: [{type: Schema.Types.ObjectId, ref: "Category"}],
    groupDeckBelongsTo: {type: Schema.Types.ObjectId, ref: "Group"},
    approvedByGroupAdmins: Boolean,
    deckCopiedFrom: {type: Schema.Types.ObjectId, ref: "Deck"}
}, {timestamps: true});

export default mongoose.model("Deck", Deck);
