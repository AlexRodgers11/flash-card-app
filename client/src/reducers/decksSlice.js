import { createSlice, createAsyncThunk }from "@reduxjs/toolkit";
import axios from "axios";
import { client } from "../utils";

const baseURL = 'http://localhost:8000';

const initialState = {
    listType: "", //group/category/user
    listId: "",//id of group/category/user that list of decks belongs to
    deckIds: [],
    sort: "a-z",
    category: "",
    search: "",
    page: 0,
    hasMore: true,
};

export const addAdminDeck = createAsyncThunk("decks/addAdminDeck", async ({deckId, groupId}) => {
    try {
        const response = await client.post(`${baseURL}/groups/${groupId}/decks`, {deckId, groupId});
        return response.data;
    } catch (err) {
        console.error(err);
    }
}); 

export const deleteDeck = createAsyncThunk("decks/deleteDeck", async (deckId) => {
    try {
        const response = await client.delete(`${baseURL}/decks/${deckId}`);
        return response.data;
    } catch (err) {
        console.error(err);
    }
});

export const fetchDecksOfUser = createAsyncThunk("decks/fetchDecksOfUser", async (userId) => {
    
    console.log("in fetchDecksOfUser");
    console.log(baseURL + "/users/" + userId + "/decks");
    try {
        const response = await client.get(baseURL + "/users/" + userId + "/decks");
        return {
            listType: "user", 
            listId: userId,
            deckIds: [...response.data],
        }
    } catch (err) {
        return err;
    }
});

export const fetchDecksOfCategory = createAsyncThunk("decks/fetchDecksOfCategory", async (categoryId) => {
    try {
        const response = await axios.get(baseURL + "/categories/" + categoryId + "/decks");
        return {
            listType: "category",
            listId: categoryId,
            deckIds: [...response.data]
        };
    } catch (err) {
        return err;
    }
});

export const fetchDecksOfGroup = createAsyncThunk("decks/fetchDecksOfGroup", async (groupId) => {
    try {
        const response = await client.get(baseURL + "/groups/" + groupId + "/decks");
        return {
            listType: "group",
            listId: groupId,
            deckIds: [...response.data]
        };
    } catch (err) {
        return err;
    }
});

export const decksSlice = createSlice({
    name: "decks",
    initialState,
    reducers: {
        addMemberSubmittedDeck: (state, action) => {
            state.deckIds = [...state.deckIds, action.payload.deckId]
        }
    },
    extraReducers: (builder) => {
        builder.addCase(addAdminDeck.fulfilled, (state, action) => {
            state.deckIds = [...state.deckIds, action.payload];
        });
        builder.addCase(deleteDeck.fulfilled, (state, action) => {
            state.deckIds = state.deckIds.filter(id => id !== action.payload);
        });
        builder.addCase(fetchDecksOfUser.fulfilled, (state, action) => {
            state.listType = action.payload.listType;
            state.listId = action.payload.listId;
            state.deckIds = action.payload.deckIds;
        });
        builder.addCase(fetchDecksOfCategory.fulfilled, (state, action) => {
            state.listType = action.payload.listType;
            state.listId = action.payload.listId;
            state.deckIds = action.payload.deckIds;
        });
        builder.addCase(fetchDecksOfGroup.fulfilled, (state, action) => {
            state.listType = action.payload.listType;
            state.listId = action.payload.listId;
            state.deckIds = action.payload.deckIds;
        });
    }

});

export const { addMemberSubmittedDeck } = decksSlice.actions;


export default decksSlice.reducer;