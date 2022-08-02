const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Group = new Schema({
    name: String,
    members: [{type: Schema.Types.ObjectId, ref: "user"}]
});

module.exports = mongoose.model("group", Group);