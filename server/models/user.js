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
    statisticsTracking: {
        type: String,
        default: "all" //all, user-only, group-only, none
    },
    accountSetupStage: String, //email, verified, complete
    privacy: {
        email: {
            type: String,
            default: "public"
        },
        name: {
            type: String,
            default: "public"
        },
        profilePhoto: {
            type: String,
            default: "public"
        },
        groups: {
            type: String,
            default: "public"
        },
        newDecks: {
            type: String,
            default: "public"
        },
        currentDecks: {
            type: String,
            default: "set-individually"
        },
    },
    communicationSettings: {
        emailPreferences: {
            cardDecision: {
                type: Boolean,
                default: true
            },
            cardSubmission: {
                type: Boolean,
                default: true
            },
            deckDecision: {
                type: Boolean,
                default: true
            },
            deckSubmission: {
                type: Boolean,
                default: true
            },
            direct: {
                type: Boolean,
                default: true
            },
            groupInvitation: {
                type: Boolean,
                default: true
            },
            invitationDecision: {
                type: Boolean,
                default: true
            },
            joinDecision: {
                type: Boolean,
                default: true
            },
            joinRequest: {
                type: Boolean,
                default: true
            }
        },
        notificationPreferences: {
            adminChange: {
                type: Boolean,
                default: true
            },
            deckAdded: {
                type: Boolean,
                default: true
            },
            groupDeleted: {
                type: Boolean,
                default: true
            },
            headAdminChange: {
                type: Boolean,
                default: true
            },
            newMemberJoined: {
                type: Boolean,
                default: true
            },
            removedFromGroup: {
                type: Boolean,
                default: true
            }
        }
    }
}, {timestamps: true});

export default mongoose.model("User", User);