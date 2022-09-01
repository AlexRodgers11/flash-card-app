import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { shuffleArray } from "../utils";

const baseURL = "http://localhost:8000";

const initialState = {
    // deckId: "",
    cards: [],
    practiceSet: [],
    missedCards: [],
    retryStatus: false,
    attempts: [],
    // userId: "",
    stats: {
        numberCorrect: 0,
        numberWrong: 0
    }
}

export const fetchDeck = createAsyncThunk("practiceSession/fetchDeck", async(deckId) => {
    // console.log("fetch deck ran");
    try {
        const response = await axios.get(`${baseURL}/decks/${deckId}?practice=true`);
        // console.log(response.data.cards);
        return {
            cards: shuffleArray(response.data.cards),
            deckId: response.data._id
        }
    } catch(err) {
        return err;
    }
});


export const practiceSessionSlice = createSlice({
    name: "practiceSession",
    initialState,
    reducers: {
        addCardAttempt: (state, action) => {
            state.attempts = [...state.attempts, {
                answeredCorrectly: action.payload.answeredCorrectly, 
                cardId: state.cards[action.payload.cardIndex]._id
                // cardId: action.payload.cardId
            }];
            if(!action.payload.answeredCorrectly) {
                // state.missedCards = [...state.missedCards, state.cards[action.payload.cardIndex]];
                state.missedCards = [...state.missedCards, state.practiceSet[action.payload.cardIndex]];
                // state.missedCards = [...state.missedCards, state.cards[action.payload.cardIndex]._id];
                state.stats.numberWrong = state.stats.numberWrong + 1;
            } else {
                state.stats.numberCorrect = state.stats.numberCorrect + 1;
            }
        },
        practiceDeckAgain: (state) => {
            if(state.retryStatus) {
                state.retryStatus = false;
            }
            state.practiceSet = shuffleArray([...state.cards]);
            state.missedCards = [];
            state.attempts = [];
            state.stats.numberCorrect = 0;
            state.stats.numberWrong = 0;
        },
        retryMissedCards: (state) => {
            // console.log("setting state for retry");
            if(!state.retryStatus) {
                state.retryStatus = true;
            }
            // console.log("retryStatus");
            // console.log(state.retryStatus);
            // console.log("state.missedCards:");
            // console.log(state.missedCards);
            state.practiceSet = shuffleArray([...state.missedCards]);
            state.missedCards = [];
            state.attempts = [];
            state.stats.numberCorrect = 0;
            state.stats.numberWrong = 0;
        },
        endPractice: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(fetchDeck.fulfilled, (state, action) => {
            state.cards = action.payload.cards;
            state.practiceSet = action.payload.cards;
        });
    }
});

export const { addCardAttempt, endPractice, practiceDeckAgain, retryMissedCards } = practiceSessionSlice.actions;
export default practiceSessionSlice.reducer;