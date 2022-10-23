import mongoose from "mongoose";

const Schema = mongoose.Schema;

//////////////
const options = { discriminatorKey: 'kind'};
//////////////

const MessageSchema = new Schema({
    sendingUser: {type: Schema.Types.ObjectId, ref: "User"},
    read: [{type: Schema.Types.ObjectId, ref: "User"}]
// }, {timestamps: true});
}, {discriminatorKey: "message", timestamps: true});

const Message = mongoose.model('Message', MessageSchema);

const CardSubmission = Message.discriminator("CardSubmission", new Schema({
    acceptanceStatus: String,
    targetDeck: {type: Schema.Types.ObjectId, ref: "Deck"},
}, options));

const DeckSubmission = Message.discriminator("DeckSubmission", new Schema({
    acceptanceStatus: String,
    targetDeck: {type: Schema.Types.ObjectId, ref: "Deck"},
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"},
}, options));

const DirectMessage = Message.discriminator("DirectMessage", new Schema({
    text: String,     
}, options));

const JoinRequest = Message.discriminator("JoinRequest", new Schema({
    acceptanceStatus: String,
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"}
}, options));

export { CardSubmission, DeckSubmission, DirectMessage, JoinRequest, Message };