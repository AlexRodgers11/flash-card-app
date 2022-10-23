import mongoose from "mongoose";

const Schema = mongoose.Schema;

// const Card = new Schema({
//     creator: {type: Schema.Types.ObjectId, ref: "user"},
//     type: String,
//     question: String,
//     correctAnswer: String,
//     wrongAnswerOne: String,
//     wrongAnswerTwo: String,
//     wrongAnswerThree: String,
//     hint: String,
//     stats: {
//         numberCorrect: Number,
//         numberIncorrect: Number
//     }
// }, {timestamps: true});

// export default mongoose.model("card", Card);

// const Schema = mongoose.Schema;

const options = { discriminatorKey: 'cardType'}

const CardSchema = new Schema({
    creator: {type: Schema.Types.ObjectId, ref: "User"},
    // type: String,
    question: String,
    correctAnswer: String,
    hint: String,
    stats: {
        numberCorrect: Number,
        numberIncorrect: Number
    }
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

