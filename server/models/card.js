import mongoose from "mongoose";

const Schema = mongoose.Schema;

const options = { discriminatorKey: 'cardType'}

const CardSchema = new Schema({
    _id: Schema.Types.ObjectId,
    creator: {type: Schema.Types.ObjectId, ref: "User"},
    question: String,
    correctAnswer: String,
    hint: String,
    attempts: [{type: Schema.Types.ObjectId, ref: "CardAttempt"}],
    groupCardBelongsTo: {type: Schema.Types.ObjectId, ref: "Group"},
    allowCopies: Boolean, //add functionality later that allows user to copy a card into one of their own decks
    cardCopiedFrom: {type: Schema.Types.ObjectId, ref: "Card"}
}, {discriminatorKey: "cardType", timestamps: true});

const Card = mongoose.model("Card", CardSchema);

const FlashCard = Card.discriminator("FlashCard", new Schema({

}, options));

const MultipleChoiceCard = Card.discriminator("MultipleChoiceCard", new Schema({
    wrongAnswerOne: String,
    wrongAnswerTwo: String,
    wrongAnswerThree: String,
}), options);

const TrueFalseCard = Card.discriminator("TrueFalseCard", new Schema({
    wrongAnswerOne: String
}, options));

export { Card, FlashCard, MultipleChoiceCard, TrueFalseCard };

