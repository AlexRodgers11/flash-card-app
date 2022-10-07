import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sendingUser: {type: Schema.Types.ObjectId, ref: "user"},
    read: [{type: Schema.Types.ObjectId, ref: "user"}]
}, {timestamps: true});

//I think all the model strings should be capitalized
const Message = mongoose.model('Message', MessageSchema);

const DirectMessage = Message.discriminator("DirectMessage", new Schema({
    message: String,     
}));

const DeckSubmission = Message.discriminator("DeckSubmission", new Schema({
    acceptanceStatus: String,
    targetDeck: {type: Schema.Types.ObjectId, ref: "deck"},
    targetGroup: {type: Schema.Types.ObjectId, ref: "group"},
}));

const CardSubmission = Message.discriminator("CardSubmission", new Schema({
    acceptanceStatus: String,
    targetDeck: {type: Schema.Types.ObjectId, ref: "deck"},
}));

export { Message, DirectMessage, DeckSubmission, CardSubmission};