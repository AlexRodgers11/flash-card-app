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
    deckAttempts: [{type: Schema.Types.ObjectId, ref: "DeckAttempt"}],
    messages: {
        sent: [{type: Schema.Types.ObjectId, ref: "Message"}],
        received: [{type: Schema.Types.ObjectId, ref: "Message"}]
    },
    notifications: [{type: Schema.Types.ObjectId, ref: "Notification"}],
    adminOf: [{type: Schema.Types.ObjectId, ref: "Group"}],
    verification: {
        code: String,
        codeExpDate: Date,
        verified: Boolean
    },
    statisticsTracking: String, //all, user-only, group-only, none
    accountSetupStage: String, //email, verified, complete
    privacy: {
        email: String,
        name: String,
        profilePhoto: String,
        groups: String,
        newDecks: String,
        currentDecks: String,
    },
    communicationSettings: {
        emailPreferences: {
            cardDecision: Boolean,
            cardSubmission: Boolean,
            deckDecision: Boolean,
            deckSubmission: Boolean,
            direct: Boolean,
            groupInvitation: Boolean,
            invitationDecision: Boolean,
            joinDecision: Boolean,
            joinRequest: Boolean
        },
        notificationPreferences: {
            adminChange: Boolean,
            deckAdded: Boolean,
            groupDeleted: Boolean,
            headAdminChange: Boolean,
            newMemberJoined: Boolean,
            removedFromGroup: Boolean
        }
    }
}, {timestamps: true});

export default mongoose.model("User", User);