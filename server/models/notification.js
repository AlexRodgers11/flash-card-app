import mongoose from "mongoose";

const Schema = mongoose.Schema;

//need to add stuff for being removed from group, changing admin, group deleted, deck added, etc

const options = { discriminatorKey: 'notificationType'};

const NotificationSchema = new Schema({
    read: Boolean,
    actor: {type: Schema.Types.ObjectId, ref: "User"},
}, {discriminatorKey: "notificationType", timestamps: true});

const Notification = mongoose.model('Notification', NotificationSchema);

const CardDecision = Notification.discriminator("CardDecision", new Schema({
    cardTarget: {type: Schema.Types.ObjectId, ref: "Card"},
    decision: String,
    deckTarget: {type: Schema.Types.ObjectId, ref: "Deck"},
    groupTarget: {type: Schema.Types.ObjectId, ref: "Group"}
}, options));

const JoinDecision = Notification.discriminator("JoinDecision", new Schema({
    decision: String,
    groupTarget: {type: Schema.Types.ObjectId, ref: "Group"}
}, options));


export {CardDecision, JoinDecision, Notification}