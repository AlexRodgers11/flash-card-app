import { createSlice, createAsyncThunk }from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = 'http://localhost:8000';

const initialState = {
    decks: []
};

export const fetchDecksOfUser = createAsyncThunk("", async (userId) => {
    try {
        const response = await axios.get(baseURL + "users/" + userId + "/decks");
        return [...response.data];
    } catch (err) {
        return err.message;
    }
});

export const fetchDecksOfCategory = createAsyncThunk("decks/fetchDecksOfCategory", async (categoryId) => {
    try {
        const response = await axios.get(baseURL + "/categories/" + categoryId);
        return [...response.data];
    } catch (err) {
        return err;
    }
});

export const decksSlice = createSlice({
    name: "decks",
    initialState,
    reducers: {},
    //for async requests
    extraReducers: (builder) => {

    }

});

export default decksSlice.reducer;