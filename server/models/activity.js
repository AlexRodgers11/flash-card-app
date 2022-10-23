import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Activity = new Schema({
    actor: {type: Schema.Types.ObjectId, ref: "User"},
    type: String,//addCard, addDeck, editDeck, deleteDeck, join
    content: String,
    groupTarget: {type: Schema.Types.ObjectId, ref: "Group"},
    deckTarget: {type: Schema.Types.ObjectId, ref: "Deck"}
}, {timestamps: true});

export default mongoose.model("Activity", Activity);

//(user) (adds) (deck) to (groupDecks)
//(user) (joins) (group)
//(deck) was (edited) by (user)

//add deck
//member joined
//deck edited