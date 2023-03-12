import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { client } from "../utils";

const baseURL = 'http://localhost:8000';

const initialState = {
    userAttempts: [],
    deckAttempt: {},
    selectedDeckId: "",
    deckAttempts: [],
    selectedCardId: "",
    selectedCardQuestion: "",
    selectedCardAnswer: "",
    cardStatsByDeck: [],
    cardAttemptIds: [],
    deckIds: [],
    deckStats: {}
}

export const fetchUserAttempts = createAsyncThunk("attempts/fetchUserAttempts", async ({userId}) => {
    const response = await client.get(`${baseURL}/users/${userId}/attempts`);
    return response.data;
});

export const fetchDeckAttempts = createAsyncThunk("attempts/fetchDeckAttempts", async ({deckId}) => {
    const response = await client.get(`${baseURL}/decks/${deckId}/attempts`);
    return {
        attempts: response.data,
        deckId: deckId
    }
});


export const fetchCardStatsByDeck = createAsyncThunk("attempts/fetchStatsCardIds", async ({userId}) => {
    const response = await client.get(`${baseURL}/users/${userId}/card-stats`);
    return response.data;
});

export const fetchCardAttemptIds = createAsyncThunk("attempts/fetchCardAttemptIds", async ({cardId}) => {
    const response = await client.get(`${baseURL}/cards/${cardId}/attempts`);
    return {
        attempts: response.data.attemptIds,
        cardId: cardId,
        cardQuestion: response.data.question,
        cardAnswer: response.data.answer
    }
});

export const fetchDeckAttemptData = createAsyncThunk("attempts/fetchDeckAttemptData" , async ({attemptId}) => {
    const response = await client.get(`${baseURL}/attempts/${attemptId}`);
    return response.data;
});

export const fetchStatsDeckIds = createAsyncThunk("attempts/fetchStatsDeckIds", async ({userId}) => {
    const response = await axios.get(`${baseURL}/users/${userId}/decks`);//this makes no sense route-wise
    console.log({data: response.data});
    return response.data;
});

export const attemptsSlice = createSlice({
    name: "attempts",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchUserAttempts.fulfilled, (state, action) => {
            state.userAttempts = action.payload;
        });
        builder.addCase(fetchCardAttemptIds.fulfilled, (state, action)=> {
            state.cardAttemptIds = action.payload.attempts;
            state.selectedCardId = action.payload.cardId;
            state.selectedCardQuestion = action.payload.cardQuestion;
            state.selectedCardAnswer = action.payload.cardAnswer;
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
        builder.addCase(fetchStatsDeckIds.fulfilled, (state, action) => {
            state.deckIds = action.payload;
        });
    }
});

export default attemptsSlice.reducer;