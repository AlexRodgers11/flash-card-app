import mongoose from "mongoose";

// const Schema = mongoose.Schema;

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

const Schema = mongoose.Schema;

const Card = new Schema({
    creator: {type: Schema.Types.ObjectId, ref: "user"},
    // type: String,
    question: String,
    correctAnswer: String,
    hint: String,
    stats: {
        numberCorrect: Number,
        numberIncorrect: Number
    }
}, {discriminatorKey: "card-type"});

const FlashCard = new Card.discriminator("FlashCard", new Schema({

}));

const MultipleChoiceCard = new Card.discriminator("MultipleChoiceCard", new Schema({
    wrongAnswerOne: String,
    wrongAnswerTwo: String,
    wrongAnswerThree: String,
}), {discriminatorKey: "card-type"});

const TrueFalseCard = new Card.discriminator("TrueFalseCard", new Schema({
    wrongAnswerOne: String
}));

export { Card, FlashCard, MultipleChoiceCard, TrueFalseCard };

