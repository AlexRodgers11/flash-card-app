import mongoose from "mongoose";

const Schema = mongoose.Schema;

const User = new Schema({
    login: {
        username: String,
        password: String,
        email: String,
        passwordResetCode: String,
        passwordResetCodeExp: Date,
        passwordResetCodeVerificationAttemptCount: Number
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
        enum: ["all", "user-only", "group-only", "none"],
        default: "all"
    },
    accountSetupStage: {
        type: String,
        enum: ["email", "verified", "complete"]
    }, //email, verified, complete
    inactivityLengthBeforeLogout: {
        type: String, //in milliseconds or "never"
        default: "3600000"
    },
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
        },
        allowDirectMessages: {
            type: Boolean,
            default: true
        },
        blockedUsers: [{type: Schema.Types.ObjectId, ref: "User"}],//not currently used but added so that existing users of app won't be missing the property when functionality added for it
    },
    subscription: {
        status: {
            type: String,
            enum: ["active", "inactive", "canceled", "expired", "discount-grandfathered-active", "discount-grandfathered-expired"],
            default: "inactive"
        },
        tier: {
            type: String,
            enum: ["basic", "pro"],
            default: "basic"
        },
        startDate: {
            type: Date,
            default: Date.now()
        },
        endDate: Date
    }
}, {timestamps: true});

export default mongoose.model("User", User);