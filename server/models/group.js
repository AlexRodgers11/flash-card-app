import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Group = new Schema({
    name: String,
    creator: {type: Schema.Types.ObjectId, ref: "user"},
    administrators: [{type: Schema.Types.ObjectId, ref: "user"}],
    members: [{type: Schema.Types.ObjectId, ref: "user"}],
    decks: [{type: Schema.Types.ObjectId, ref: "deck"}],
    activity: [{type: Schema.Types.ObjectId, ref: "activity"}],
    joinCode: String
});

export default mongoose.model("group", Group);