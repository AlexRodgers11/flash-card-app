import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sendingUser: {type: Schema.Types.ObjectId, ref: "User"},
    receivingUsers: [{type: Schema.Types.ObjectId, ref: "User"}],
    read: {
        type: [{type: Schema.Types.ObjectId, ref: "User"}],
        default: []
    },
    sendingUserDeleted: {
        type: Boolean,
        default: false
    }
}, {discriminatorKey: "messageType", timestamps: true});

const Message = mongoose.model('Message', MessageSchema);

const DeckSubmission = Message.discriminator("DeckSubmission", new Schema({
    acceptanceStatus: String,
    deckName: String,//need this in addition to the id because the id will be deleted if the deck isn't approved 
    targetDeck: {type: Schema.Types.ObjectId, ref: "Deck"},
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"},
}));

const DeckDecision = Message.discriminator("DeckDecision", new Schema({
    acceptanceStatus: String, 
    comment: String,
    deckName: String,//need this in addition to the id because the id will be deleted if the deck isn't approved 
    targetDeck: {type: Schema.Types.ObjectId, ref: "Deck"},
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"},
    targetUser: {type: Schema.Types.ObjectId, ref: "User"},
}));

const JoinRequest = Message.discriminator("JoinRequest", new Schema({
    acceptanceStatus: String,
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"}
}));

const JoinDecision = Message.discriminator("JoinDecision", new Schema({
    acceptanceStatus: String, 
    comment: String,
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"},
    targetUser: {type: Schema.Types.ObjectId, ref: "User"}
}));

const GroupInvitation = Message.discriminator("GroupInvitation", new Schema({
    comment: String,
    acceptanceStatus: {//make default for all messages with acceptanceStatus
        type: String,
        default: "pending"
    },
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"},
    targetUser: {type: Schema.Types.ObjectId, ref: "User"}
}));

const InvitationDecision = Message.discriminator("InvitationDecision", new Schema({
    acceptanceStatus: String,
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"},
    // targetUser: {type: Schema.Types.ObjectId, ref: "User"}
}));

const CardSubmission = Message.discriminator("CardSubmission", new Schema({
    acceptanceStatus: String,
    targetDeck: {type: Schema.Types.ObjectId, ref: "Deck"},
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"}
}));

const CardDecision = Message.discriminator("CardDecision", new Schema({
    targetCard: {type: Schema.Types.ObjectId, ref: "Card"},
    decision: String,
    comment: String,
    targetDeck: {type: Schema.Types.ObjectId, ref: "Deck"},
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"}
}));

const DirectMessage = Message.discriminator("DirectMessage", new Schema({
    text: String,
}));




export { CardDecision, CardSubmission, DeckDecision, DeckSubmission, DirectMessage, GroupInvitation, InvitationDecision, JoinRequest, JoinDecision, Message };