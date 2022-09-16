import mongoose, { Schema, Schema, Schema } from "mongoose";

const Schema = mongoose.Schema({
    actor: {type: Schema.Types.ObjectId, ref: "user"},
    type: String,//deck added to group, group notifications, 
    content: String,
    actor: {type: Schema.Types.ObjectId, ref: "user"} ,
    groupTarget: {type: Schema.Types.ObjectId, ref: "group"},
    deckTarget: {type: Schema.Types.ObjectId, ref: "deck"},
    cardTarget: {type: Schema.Types.ObjectId, ref: "card"}
}, {timestamps: true});

