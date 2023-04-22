import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { client } from "../utils";

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const initialState = {
    userAttempts: [],
    deckAttempt: {},
    selectedDeckId: "",
    deckAttempts: [],
    selectedCard: {},
    cardStatsByDeck: [],
    cardAttempts: [],
    deckIds: [],
    decksStats: [],
}

export const fetchUserAttempts = createAsyncThunk("attempts/fetchUserAttempts", async ({userId}) => {
    const response = await client.get(`${baseURL}/users/${userId}/attempts`);
    const dateConvertedAttempts = response.data.map(attempt => {
        const date = new Date(attempt.datePracticed);
        const options = {month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric"};
        const locale = navigator.language;
        const localDateString = date.toLocaleDateString(locale || "en-US", options);
        return {...attempt, datePracticed: localDateString};
    });
    
    return dateConvertedAttempts;
});

export const fetchDeckAttempts = createAsyncThunk("attempts/fetchDeckAttempts", async ({deckId}) => {
    const response = await client.get(`${baseURL}/decks/${deckId}/attempts`);
    const dateConvertedAttempts = response.data.map(attempt => {
        const date = new Date(attempt.datePracticed);
        const options = {month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric"};
        const locale = navigator.language;
        const localDateString = date.toLocaleDateString(locale || "en-US", options);
        return {...attempt, datePracticed: localDateString};
    });
    return {
        attempts: dateConvertedAttempts,
        deckId: deckId
    }
});


export const fetchCardStatsByDeck = createAsyncThunk("attempts/fetchStatsCardIds", async ({userId}) => {
    const response = await client.get(`${baseURL}/users/${userId}/card-stats`);
    const dateConvertedStats = response.data.map(deck => {
        const dateConvertedCardStats = deck.cards.map(card => {
            if(card.dateLastPracticed) {
                const date = new Date(card.dateLastPracticed);
                const options = {month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric"};
                const locale = navigator.language;
                const localDateString = date.toLocaleDateString(locale || "en-US", options);
                return {...card, dateLastPracticed: localDateString};
            } else {
                return card;
            }
        });
        return {...deck, cards: dateConvertedCardStats};
    });

    return dateConvertedStats;
});

export const fetchCardAttempts = createAsyncThunk("attempts/fetchCardAttempts", async ({cardId}) => {
    const response = await client.get(`${baseURL}/cards/${cardId}/attempts`);
    const dateConvertedAttempts = response.data.attempts.map(attempt => {
        const date = new Date(attempt.datePracticed);
        const options = {month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric"};
        const locale = navigator.language;
        const localDateString = date.toLocaleDateString(locale || "en-US", options);
        return {...attempt, datePracticed: localDateString};
    })
    return {
        attempts: dateConvertedAttempts,
        selectedCard: response.data.selectedCard
    }
});

export const fetchDeckAttemptData = createAsyncThunk("attempts/fetchDeckAttemptData" , async ({attemptId}) => {
    const response = await client.get(`${baseURL}/attempts/${attemptId}`);
    return response.data;
});

export const fetchAllDecksStats = createAsyncThunk("attempts/fetchAllDecksStats", async ({userId}) => {
    const response = await client.get(`${baseURL}/users/${userId}/decks/statistics`);
    const dateConvertedStats = response.data.map(deck => {
        if(deck.dateLastPracticed) {
            const date = new Date(deck.dateLastPracticed);
            const options = {month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric"};
            const locale = navigator.language;
            const localDateString = date.toLocaleDateString(locale || "en-US", options);
            return {...deck, dateLastPracticed: localDateString};
        } else {
            return deck;
        }
    });

    return dateConvertedStats;
});

export const attemptsSlice = createSlice({
    name: "attempts",
    initialState,
    reducers: {
        resetStats: (state) => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUserAttempts.fulfilled, (state, action) => {
            state.userAttempts = action.payload;
        });
        builder.addCase(fetchCardAttempts.fulfilled, (state, action)=> {
            state.cardAttempts = action.payload.attempts;
            state.selectedCard = action.payload.selectedCard;
        });
        builder.addCase(fetchDeckAttempts.fulfilled, (state, action) => {
            state.deckAttempts = action.payload.attempts;
            state.selectedDeckId = action.payload.deckId;
        });
        builder.addCase(fetchDeckAttemptData.fulfilled, (state, action) => {
            state.deckAttempt = action.payload;
        });
        builder.addCase(fetchCardStatsByDeck.fulfilled, (state, action) => {
            state.cardStatsByDeck = action.payload;
        });
        builder.addCase(fetchAllDecksStats.fulfilled, (state, action) => {
            state.decksStats = action.payload;
        });
    }
});

export const { resetStats } = attemptsSlice.actions;
export default attemptsSlice.reducer;