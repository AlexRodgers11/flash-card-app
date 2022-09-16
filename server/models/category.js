import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Category = new Schema({
    name: String,
    decks: [{type: Schema.Types.ObjectId, ref: "deck"}]
}, {timestamps: true});

export default mongoose.model("category", Category);