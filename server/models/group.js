const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Group = new Schema({
    name: String,
    members: [{type: Schema.Types.ObjectId, ref: "user"}],
    decks: [{type: Schema.Types.ObjectId, ref: "deck"}]
});

module.exports = mongoose.model("group", Group);