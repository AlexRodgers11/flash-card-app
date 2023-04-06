import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { client } from "../utils";

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';


const initialState = {
    deckId: "",
    name: "",
    allowCopies: false,
    publiclyAvailable: false,
    creator: "",
    cards: [],
    groupDeckBelongsTo: ""
}

export const addCard = createAsyncThunk("deck/addCard", async ({newCard, deckId}) => {
    try {
        const response = await client.post(`${baseURL}/decks/${deckId}/cards`, newCard);
        return response.data
    } catch (err) {
        console.error(err);
    }
});

export const deleteCard = createAsyncThunk("deck/deleteCard", async ({cardToDeleteId}) => {
    try {
        const response = await client.delete(`${baseURL}/cards/${cardToDeleteId}`);
        return response.data;
    } catch (err) {
        console.error(err);
    }
});

export const fetchDeck = createAsyncThunk("deck/fetchDeck", async (deckId) => {
    try {
        const response = await client.get(`${baseURL}/decks/${deckId}`);
        return {
            ...response.data
        }
    } catch (err) {
        return err;
    }
});

export const updateDeck = createAsyncThunk("deck/updateDeck", async ({deckId, deckUpdates}) => {
    try {
        const response = await client.patch(`${baseURL}/decks/${deckId}`, deckUpdates );
        const stateUpdateObj = {};
        for(const key in deckUpdates) {
            if(response.data.hasOwnProperty(key)) {
                stateUpdateObj[key] = response.data[key];
            }
        }
        return stateUpdateObj;
    } catch (err) {}
});

export const deckSlice = createSlice({
    name: "deck",
    initialState,
    reducers: {
        resetDeck: (state) => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(addCard.fulfilled, (state, action) => {
            state.cards = [...state.cards, action.payload]
        });
        builder.addCase(deleteCard.fulfilled, (state, action) => {
            state.cards = state.cards.filter(cardId => cardId !== action.payload);
        });
        builder.addCase(fetchDeck.fulfilled, (state, action) => {
            state.deckId = action.payload._id;
            state.name = action.payload.name;
            state.publiclyAvailable = action.payload.publiclyAvailable;
            state.allowCopies = action.payload.allowCopies;
            state.creator = action.payload.creator;
            state.cards = [...action.payload.cards];
            state.groupDeckBelongsTo = action.payload.groupDeckBelongsTo;
        });
        builder.addCase(updateDeck.fulfilled, (state, action) => {
            for(const key in action.payload) {
                if(initialState.hasOwnProperty(key)) {
                    state[key] = action.payload[key];
                }
            }
        });
    }
});

export const { resetDeck } = deckSlice.actions;
export default deckSlice.reducer;