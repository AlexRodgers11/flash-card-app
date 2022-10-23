import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Deck = new Schema({
    name: String,
    publiclyAvailable: Boolean,
    creator: {type: Schema.Types.ObjectId, ref: "User"},
    cards: [{type: Schema.Types.ObjectId, ref: "Card"}],
    permissions: {
        view: [{type: Schema.Types.ObjectId, ref: "User"}],
        edit: [{type: Schema.Types.ObjectId, ref: "User"}],
        copy: Boolean,
        suggest: Boolean
    }
}, {timestamps: true});

export default mongoose.model("Deck", Deck);
