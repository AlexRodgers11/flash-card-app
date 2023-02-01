import mongoose from "mongoose";

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    read: Boolean,
    // actor: {type: Schema.Types.ObjectId, ref: "User"},
}, {discriminatorKey: "notificationType", timestamps: true});

const Notification = mongoose.model('Notification', NotificationSchema);

const NewMemberJoinedNotification = Notification.discriminator("NewMemberJoined", new Schema({
    member: {type: Schema.Types.ObjectId, ref: "User"},
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"}
}));

const DeckAddedNotification = Notification.discriminator("DeckAdded", new Schema({
    targetDeck: {type: Schema.Types.ObjectId, ref: "Deck"},
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"}
}));

//for now will only notify the person added to or removed from admins, but may send something to everyone eventually
const AdminChangeNotification = Notification.discriminator("AdminChange", new Schema({
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"},
    decidingUser: {type: Schema.Types.ObjectId, ref: "User"},
    action: String //"added" or "removed" from admins
}));

//consider adding notification to admins when someone chooses to leave
const RemovedFromGroupNotification = Notification.discriminator("RemovedFromGroup", new Schema({
    targetGroup: {type: Schema.Types.ObjectId, ref: "Group"},
    //consider adding warning on front end that a notification will be sent to the removed user including the name of the remover
    decidingUser: {type: Schema.Types.ObjectId, ref: "User"}
}));

const GroupDeletedNotification = Notification.discriminator("GroupDeleted", new Schema({
    groupName: String
}));

const HeadAdminChangeNotification = Notification.discriminator("HeadAdminChange", new Schema({
    previousHeadAdmin: {type: Schema.Types.ObjectId, ref: "User"},
    newHeadAdmin: {type: Schema.Types.ObjectId, ref: "User"},
    targetGroup: {type: Schema.Types.ObjectId, ref:"Group"}
}));






export {AdminChangeNotification, DeckAddedNotification, GroupDeletedNotification, HeadAdminChangeNotification, NewMemberJoinedNotification, Notification, RemovedFromGroupNotification}