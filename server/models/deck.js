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
    //these two new properties allow for a submitted deck to be private and unsearchable by BrowseDecks, but allow admins to still view it. It also allows for group decks to be private but members still be able to see it
    groupDeckBelongsTo: {type: Schema.Types.ObjectId, ref: "Group"},
    approvedByGroupAdmins: Boolean


}, {timestamps: true});

export default mongoose.model("Deck", Deck);
