import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

//user has array of decks to choose from
////when user chooses a deck that is theirs they can view, practice, or delete
////when they are viewing need all the cards and all the cards' questions at a minimum. Could include answers or have that be a separate card modal

const baseURL = 'http://localhost:8000';


const initialState = {
    deckId: "",
    name: "",
    public: false,
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
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchDeck.fulfilled, (state, action) => {
            state.deckId = action.payload._id;
            state.name = action.payload.name;
            state.public = action.payload.public;
            state.creator = action.payload.creator;
            state.cards = [...action.payload.cards];
            state.permissions.view = action.payload.permissions.view;
            state.permissions.edit = action.payload.permissions.edit;
            state.permissions.copy = action.payload.permissions.copy;
            state.permissions.suggest = action.payload.permissions.suggest;
        });
    }
});

export default deckSlice.reducer;