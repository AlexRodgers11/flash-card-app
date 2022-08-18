import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = "http://localhost:8000";

const initialState = {
    groupId: "",
    name: "",
    memberIds: []
};

export const fetchGroupData = createAsyncThunk("group/fetchGroupData", async (groupId) => {
    try {
        const response = await axios.get(`${baseURL}/groups/${groupId}`);
        return {
            groupId: response.data._id,
            name: response.data.name,
            memberIds: [...response.data.members]
        }
    } catch (err) {
        return err;
    }
});

export const groupSlice = createSlice({
    name: "group", 
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(fetchGroupData.fulfilled, (state, action) => {
            state.groupId = action.payload.groupId;
            state.name = action.payload.name;
            state.memberIds = action.payload.memberIds;
        });
    }
});

export default groupSlice.reducer;