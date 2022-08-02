const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Category = new Schema({
    name: String,
    decks: [{type: Schema.Types.ObjectId, ref: "deck"}]
});

module.exports = mongoose.model("category", Category);