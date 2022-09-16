import mongoose from "mongoose";

const Schema = mongoose.Schema;

const Activity = new Schema({
    actor: {type: Schema.Types.ObjectId, ref: "user"},
    type: String,//addCard, addDeck, editDeck, deleteDeck, join
    content: String,
    groupTarget: {type: Schema.Types.ObjectId, ref: "group"},
    deckTarget: {type: Schema.Types.ObjectId, ref: "deck"}
});

export default mongoose.model("activity", Activity);

//(user) (adds) (deck) to (groupDecks)
//(user) (joins) (group)
//(deck) was (edited) by (user)

//add deck
//member joined
//deck edited