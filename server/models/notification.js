import mongoose, { Schema, Schema, Schema } from "mongoose";

const Schema = mongoose.Schema({
    date: Date,
    actor: {type: Schema.Types.ObjectId, ref: "user"},
    type: String,//message, suggestion, join request
    content: String,
    actor: {type: Schema.Types.ObjectId, ref: "user"} ,
    groupTarget: {type: Schema.Types.ObjectId, ref: "group"},
    deckTarget: {type: Schema.Types.ObjectId, ref: "deck"},
    cardTarget: {type: Schema.Types.ObjectId, ref: "card"}
});

//message
////direct message
////join request
////suggestion