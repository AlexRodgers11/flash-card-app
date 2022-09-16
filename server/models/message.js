import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Message = new Schema({
    sender: {type: Schema.Types.ObjectId, ref: "user"},
    message: String
});

export default mongoose.model("message", Message);