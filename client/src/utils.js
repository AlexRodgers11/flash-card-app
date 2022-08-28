import FlashCard from "./components/FlashCard";
import MultipleChoiceCard from "./components/MultipleChoiceCard";
import TrueFalseCard from "./components/TrueFalseCard";



////Durstenfeld shuffle, copied from https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export const createCard = (card, func) => {
    switch(card.type) {
        case 'flash-card': 
            return <FlashCard card={card} answerCard={func}/>
        case 'true-false':
            return <TrueFalseCard card={card} answerCard={func}/>
        case 'multiple-choice':
            return <MultipleChoiceCard card={card} answerCard={func}/>
        default:
            console.error("createCard function passed an invalid argument");
    }
}