import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Message = new Schema({
    type: String,
    sendingUser: {type: Schema.Types.ObjectId, ref: "user"},
    sendingGroup: {type: Schema.Types.ObjectId, ref: "group"},
    // receivingUser: {type: Schema.Types.ObjectId, ref: "user"},
    targetDeck: {type: Schema.Types.ObjectId, ref: "deck"},
    targetCard: {type: Schema.Types.ObjectId, ref: "card"},
    targetGroup: {type: Schema.Types.ObjectId, ref: "group"},
    message: String,
    read: Boolean
}, {timestamps: true});

export default mongoose.model("message", Message);