import mongoose from "mongoose";

const Schema = mongoose.Schema;

const User = new Schema({
    login: {
        username: String,
        password: String,
        email: String
    },
    name: {
        first: String,
        last: String
    },
    photo: String,
    decks: [{type: Schema.Types.ObjectId, ref: "Deck"}],
    groups: [{type: Schema.Types.ObjectId, ref: "Group"}],
    attempts: [{type: Schema.Types.ObjectId, ref: "Attempt"}],
    messages: {
        sent: [{type: Schema.Types.ObjectId, ref: "Message"}],
        received: [{type: Schema.Types.ObjectId, ref: "Message"}]
    },
    notifications: [{type: Schema.Types.ObjectId, ref: "Notification"}],
    adminOf: [{type: Schema.Types.ObjectId, ref: "Group"}]
}, {timestamps: true});

export default mongoose.model("User", User);