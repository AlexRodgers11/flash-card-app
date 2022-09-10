import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = 'http://localhost:8000';


const initialState = {
    deckId: "",
    name: "",
    publiclyAvailable: false,
    creator: "",
    cards: [],
    permissions: {
        view: [],
        edit: [],
        copy: false,
        suggest: false
    }

}

export const fetchDeck = createAsyncThunk("deck/fetchDeck", async (deckId) => {
    try {
        const response = await axios.get(`${baseURL}/decks/${deckId}`);
        return {
            ...response.data
        }
    } catch (err) {
        return err;
    }
});

export const deckSlice = createSlice({
    name: "deck",
    initialState,
    reducers: {
        addCard: (state, action) => {
            state.cards = [...state.cards, action.payload.cardId];
        },
        deleteCard: (state, action) => {
            state.cards = state.cards.filter(cardId => cardId !== action.payload.cardId);
        },
        editDeckName: (state, action) => {
            state.name = action.payload.name
        },
        editPubliclyAvailable: (state, action) => {
            state.publiclyAvailable = action.payload.publiclyAvailable;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchDeck.fulfilled, (state, action) => {
            state.deckId = action.payload._id;
            state.name = action.payload.name;
            state.publiclyAvailable = action.payload.publiclyAvailable;
            state.creator = action.payload.creator;
            state.cards = [...action.payload.cards];
            state.permissions.view = action.payload.permissions.view;
            state.permissions.edit = action.payload.permissions.edit;
            state.permissions.copy = action.payload.permissions.copy;
            state.permissions.suggest = action.payload.permissions.suggest;
        });
    }
});

export const { addCard, deleteCard, editDeckName, editPubliclyAvailable } = deckSlice.actions;
export default deckSlice.reducer;