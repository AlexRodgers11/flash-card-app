import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Notification = new Schema({
    type: String,//deck added to group, group notifications, 
    content: String,
    read: Boolean,
    actor: {type: Schema.Types.ObjectId, ref: "user"} ,
    groupTarget: {type: Schema.Types.ObjectId, ref: "group"},
    deckTarget: {type: Schema.Types.ObjectId, ref: "deck"},
    cardTarget: {type: Schema.Types.ObjectId, ref: "card"}
}, {timestamps: true});

export default mongoose.model('notification', Notification);