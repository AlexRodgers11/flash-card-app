import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Attempt = new Schema({
    user: {type: Schema.Types.ObjectId, ref: "User"},
    deck: {type: Schema.Types.ObjectId, ref: "Deck"},
    datePracticed: Date,
    cards: [{
        cardId: String,
        answeredCorrectly: Boolean
    }]
}, {timestamps: true});

const attemptModel = mongoose.model("Attempt", Attempt);
export default attemptModel;