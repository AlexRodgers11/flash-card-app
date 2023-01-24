import mongoose from "mongoose";

const Schema = mongoose.Schema;

//need to add stuff for being removed from group, changing admin, group deleted, deck added, etc

const options = { discriminatorKey: 'notificationType'};

const NotificationSchema = new Schema({
    read: Boolean,
    // actor: {type: Schema.Types.ObjectId, ref: "User"},
}, {discriminatorKey: "notificationType", timestamps: true});

const Notification = mongoose.model('Notification', NotificationSchema);

const DeckAdded =  Notification.discriminator("DeckAdded", new Schema({
    deck: {type: Schema.Types.ObjectId, ref: "Deck"},
    groupTarget: {type: Schema.Types.ObjectId, ref: "Group"}
}));

const NewMemberJoined =  Notification.discriminator("NewMemberJoined", new Schema({
    member: {type: Schema.Types.ObjectId, ref: "User"},
    groupTarget: {type: Schema.Types.ObjectId, ref: "Group"}
}));

const HeadAdminChange =  Notification.discriminator("HeadAdminChange", new Schema({
    // previousAdmin: {type: Schema.Types.ObjectId, ref: "User"},
    newAdmin: {type: Schema.Types.ObjectId, ref: "User"}
}));

//be sure to create notification before deleting group so the ID still exists to retrieve the group name from
const GroupDeleted =  Notification.discriminator("GroupDeleted", new Schema({
    groupTarget: {type: Schema.Types.ObjectId, ref: "Group"}
}));

const RemovedFromGroup =  Notification.discriminator("RemovedFromGroup", new Schema({
    groupTarget: {type: Schema.Types.ObjectId, ref: "Group"}
}));

const AdminChange =  Notification.discriminator("AdminChange", new Schema({
    groupTarget: {type: Schema.Types.ObjectId, ref: "Group"},
    decider: {type: Schema.Types.ObjectId, ref: "User"},
    action: String //"added" or "removed" from admins
}));



export {AdminChange, DeckAdded, GroupDeleted, HeadAdminChange, NewMemberJoined, Notification, RemovedFromGroup}