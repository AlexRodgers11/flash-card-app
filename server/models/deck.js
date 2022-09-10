import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Deck = new Schema({
    name: String,
    publiclyAvailable: Boolean,
    creator: {type: Schema.Types.ObjectId, ref: "user"},
    dateCreated: Date, 
    cards: [{type: Schema.Types.ObjectId, ref: "card"}],
    permissions: {
        view: [{type: Schema.Types.ObjectId, ref: "user"}],
        edit: [{type: Schema.Types.ObjectId, ref: "user"}],
        copy: Boolean,
        suggest: Boolean
    }
});

export default mongoose.model("deck", Deck);
