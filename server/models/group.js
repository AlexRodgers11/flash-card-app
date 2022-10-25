import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Group = new Schema({
    name: String,
    creator: {type: Schema.Types.ObjectId, ref: "User"},
    administrators: [{type: Schema.Types.ObjectId, ref: "User"}],
    members: [{type: Schema.Types.ObjectId, ref: "User"}],
    decks: [{type: Schema.Types.ObjectId, ref: "Deck"}],
    activities: [{type: Schema.Types.ObjectId, ref: "Activity"}],
    allowJoinWithCode: Boolean,
    joinCode: String
}, {timestamps: true});

export default mongoose.model("Group", Group);