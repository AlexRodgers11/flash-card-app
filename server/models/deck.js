import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Deck = new Schema({
    name: String,
    publiclyAvailable: Boolean,
    creator: {type: Schema.Types.ObjectId, ref: "User"},
    attempts: [{type: Schema.Types.ObjectId, ref: "Attempts"}],
    cards: [{type: Schema.Types.ObjectId, ref: "Card"}],
    //didn't have this because when retrieving decks of a category can just search that category. The problem is if I want to display on the deck what categories it belongs to have to search ALL categories for ALL decks, which would be too long
    categories: [{type: Schema.Types.ObjectId, ref: "Category"}],
    permissions: {
        view: [{type: Schema.Types.ObjectId, ref: "User"}],
        edit: [{type: Schema.Types.ObjectId, ref: "User"}],
        copy: Boolean,
        suggest: Boolean
    }
}, {timestamps: true});

export default mongoose.model("Deck", Deck);
