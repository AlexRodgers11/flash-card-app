import mongoose from "mongoose";

const Schema = mongoose.Schema;

// const Notification = new Schema({
//     type: String,//deck added to group, group notifications, 
//     content: String,
//     read: Boolean,
//     actor: {type: Schema.Types.ObjectId, ref: "user"} ,
//     groupTarget: {type: Schema.Types.ObjectId, ref: "group"},
//     deckTarget: {type: Schema.Types.ObjectId, ref: "deck"},
//     cardTarget: {type: Schema.Types.ObjectId, ref: "card"}
// }, {timestamps: true});

const NotificationSchema = new Schema({
    type: String,
    read: Boolean,
    actor: {type: Schema.Types.ObjectId, ref: "User"},
}, {timestamps: true});

const Notification = mongoose.model('Notification', NotificationSchema);

const CardDecision = Notification.discriminator("CardApproval", new Schema({
    cardTarget: {type: Schema.Types.ObjectId, ref: "Card"},
    decision: String,
    deckTarget: {type: Schema.Types.ObjectId, ref: "Deck"},
    groupTarget: {type: Schema.Types.ObjectId, ref: "Group"}
}));

const DeckDecision = Notification.discriminator("DeckApproval", new Schema({
    decision: String,
    deckTarget: {type: Schema.Types.ObjectId, ref: "Deck"},
    groupTarget: {type: Schema.Types.ObjectId, ref: "Group"}
}));

const JoinDecision = Notification.discriminator("JoinApproval", new Schema({
    decision: String,
    groupTarget: {type: Schema.Types.ObjectId, ref: "Group"}
}));


//maybe one model for each type, that encompasses both acceptance and declination

export {CardDecision, DeckDecision, JoinDecision, Notification}

// export default mongoose.model('notification', Notification);