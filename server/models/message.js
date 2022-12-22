import mongoose from "mongoose";

const Schema = mongoose.Schema;

// //////////////
// const options = { discriminatorKey: 'kind'};
// //////////////

const MessageSchema = new Schema({
    sendingUser: {type: Schema.Types.ObjectId, ref: "User"},
    read: [{type: Schema.Types.ObjectId, ref: "User"}]
// }, {timestamps: true});
// }, {discriminatorKey: "messageType", timestamps: true});
}, {discriminatorKey: "message", timestamps: true});

const Message = mongoose.model('Message', MessageSchema);

const CardSubmission = Message.discriminator("CardSubmission", new Schema({
    acceptanceStatus: String,
    targetDeck: {type: Schema.Types.ObjectId, ref: "Deck"},
}));

const DeckSubmission = Message.discriminator("DeckSubmission", new Schema({
    acceptanceStatus: String,
    targetDeck: {type: Schema.Types.ObjectId, ref: "Deck"},
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"},
}));

const DeckDecision = Message.discriminator("DeckDecision", new Schema({
    acceptanceStatus: String, 
    comment: String,
    targetDeck: {type: Schema.Types.ObjectId, ref: "Deck"}, 
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"}
}));

const DirectMessage = Message.discriminator("DirectMessage", new Schema({
    text: String,     
}));

const JoinRequest = Message.discriminator("JoinRequest", new Schema({
    acceptanceStatus: String,
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"}
}));

export { CardSubmission, DeckDecision, DeckSubmission, DirectMessage, JoinRequest, Message };