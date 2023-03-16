import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { client, shuffleArray } from "../utils";

const baseURL = "http://localhost:8000";

const initialState = {
    practicedSinceAttemptsPulled: false,
    cards: [],
    activeCard: {
        type: "",
        hint: "",
        question: "",
        correctAnswer: "",
        wrongAnswerOne: "",
        wrongAnswerTwo: "",
        wrongAnswerThree: ""
    },
    cardAnswered: false,
    practiceSet: [],
    missedCards: [],
    retryStatus: false,
    cardAttempts: [],
    stats: {
        numberCorrect: 0,
        numberWrong: 0
    },
    numCards: 0
}

export const fetchDeck = createAsyncThunk("practiceSession/fetchDeck", async(deckId) => {
    try {
        const response = await client.get(`${baseURL}/decks/${deckId}/practice`);
        const cards = response.data.cards;

        const practiceSet = shuffleArray(response.data.cards).map(card => {
            if(card.cardType === "MultipleChoiceCard") {
                card.answers = shuffleArray([card.correctAnswer, card.wrongAnswerOne, card.wrongAnswerTwo, card.wrongAnswerThree]);
                delete card.wrongAnswerOne;
                delete card.wrongAnswerTwo;
                delete card.wrongAnswerThree;
            }
            return card;
        });

        return {
            cards,
            practiceSet,
            deckId: response.data._id,
            activeCard: practiceSet.pop()
        }
    } catch(err) {
        return err;
    }
});

const saveAttempts = async (deckId, userId, cardAttempts, accuracyRate) => {
    console.log("saving attempts");
    try {
        await client.post(`${baseURL}/users/${userId}/attempts`, {
            user: userId,
            deck: deckId,
            datePracticed: Date.now(),
            cardAttempts: cardAttempts,
            accuracyRate: accuracyRate
        });
    } catch (err) {
        console.error(err);
    }
}

export const practiceDeckAgain = createAsyncThunk("practiceSession/practiceDeckAgain", async ({deckId, userId, retryStatus, cardAttempts, accuracyRate}) => {
    if(!retryStatus) {
        await saveAttempts(deckId, userId, cardAttempts, accuracyRate)
    }
    return [];
});

export const retryMissedCards = createAsyncThunk("practiceSession/retryMissedCards", async ({deckId, userId, retryStatus, cardAttempts, accuracyRate}) => {
    if(!retryStatus) {
        await saveAttempts(deckId, userId, cardAttempts, accuracyRate);
    }
    return [];
});

export const endPractice = createAsyncThunk("practiceSession/endPractice", async ({deckId, userId, retryStatus, cardAttempts, accuracyRate}) => {
    if(!retryStatus) {
        await saveAttempts(deckId, userId, cardAttempts, accuracyRate);
    }
    return [];
});


export const practiceSessionSlice = createSlice({
    name: "practiceSession",
    initialState,
    reducers: {
        addCardAttempt: (state, action) => {
            state.cardAttempts = [...state.cardAttempts, {
                answeredCorrectly: action.payload.answeredCorrectly, 
                cardId: action.payload.cardId,
                cardType: action.payload.cardType,
                question: action.payload.question,
                wrongAnswerSelected: action.payload.wrongAnswerSelected,
                datePracticed: action.payload.datePracticed,
                correctAnswer: action.payload.correctAnswer
            }];
            if(!action.payload.answeredCorrectly) {
                state.missedCards = [...state.missedCards, action.payload.cardId];
                state.stats.numberWrong = state.stats.numberWrong + 1;
            } else {
                state.stats.numberCorrect = state.stats.numberCorrect + 1;
            }
            let practiceSetCopy = [...state.practiceSet];
            state.activeCard = practiceSetCopy.pop();
            state.cardAnswered = false;
            state.practiceSet = practiceSetCopy;
        },
        answerCard: (state) => {
            state.cardAnswered = true;
        },
        resetPracticedSinceAttemptsPulled: (state) => {
            state.practicedSinceAttemptsPulled = false;
        },
        resetSession: (state) => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(endPractice.fulfilled, () => {
            return {...initialState, practicedSinceAttemptsPulled: true};
        });
        builder.addCase(fetchDeck.fulfilled, (state, action) => {
            state.cards = action.payload.cards;
            state.numCards = action.payload.cards.length;
            state.practiceSet = action.payload.practiceSet;
            state.activeCard = action.payload.activeCard;
        });
        builder.addCase(practiceDeckAgain.fulfilled, (state) => {
            let shuffledCards = shuffleArray(state.cards).map(card => {
                if(card.cardType === "MultipleChoiceCard") {
                    card.answers = shuffleArray(card.answers);
                }
                return card;
            });
            state.numCards = shuffledCards.length;
            state.activeCard = shuffledCards.pop();
            state.practiceSet = shuffledCards;
            state.missedCards = [];
            state.cardAttempts = [];
            state.stats.numberCorrect = 0;
            state.stats.numberWrong = 0;
            state.retryStatus = false;
            state.practicedSinceAttemptsPulled = true;
        });
        builder.addCase(retryMissedCards.fulfilled, (state) => {
            let shuffledCards = shuffleArray(state.cards.filter(card => state.missedCards.includes(card._id)));
            state.numCards = shuffledCards.length;
            state.activeCard = shuffledCards.pop();
            state.practiceSet = shuffledCards;
            state.missedCards = [];
            state.cardAttempts = [];
            state.stats.numberCorrect = 0;
            state.stats.numberWrong = 0;
            state.retryStatus = true;
            state.practicedSinceAttemptsPulled = true;
        });
    }
});

export const { addCardAttempt, answerCard, resetPracticedSinceAttemptsPulled, resetSession } = practiceSessionSlice.actions;
export default practiceSessionSlice.reducer;