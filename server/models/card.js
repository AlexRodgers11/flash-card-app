import mongoose from "mongoose";

const Schema = mongoose.Schema;

const options = { discriminatorKey: 'cardType'}

const CardSchema = new Schema({
    creator: {type: Schema.Types.ObjectId, ref: "User"},
    question: String,
    correctAnswer: String,
    hint: String,
    attempts: [{type: Schema.Types.ObjectId, ref: "CardAttempt"}]
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

