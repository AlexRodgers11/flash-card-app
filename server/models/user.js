import mongoose from "mongoose";

const Schema = mongoose.Schema;

const User = new Schema({
    login: {
        username: String,
        password: String
    },
    name: {
        first: String,
        last: String
    },
    email: String,
    photo: String,
    decks: [{type: Schema.Types.ObjectId, ref: "deck"}],
    groups: [{type: Schema.Types.ObjectId, ref: "group"}],
    attempts: [{type: Schema.Types.ObjectId, ref: "attempt"}]
});

export default mongoose.model("user", User);