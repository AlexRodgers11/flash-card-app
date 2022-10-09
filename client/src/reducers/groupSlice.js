import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = "http://localhost:8000";

const initialState = {
    groupId: "",
    name: "",
    memberIds: [],
    creator: "",
    administrators: [],
    activity: [],
    joinCode: ""
};

export const fetchGroupData = createAsyncThunk("group/fetchGroupData", async (groupId) => {
    try {
        const response = await axios.get(`${baseURL}/groups/${groupId}`);
        return {
            groupId: response.data._id,
            name: response.data.name,
            creator: response.data.creator,
            administrators: response.data.administrators,
            memberIds: [...response.data.members],
            activity: response.data.activity,
            joinCode: response.data.joinCode
        }
    } catch (err) {
        return err;
    }
});

export const updateJoinCode = createAsyncThunk("group/updateJoinCode", async({groupId, code}) => {
    console.log({groupId});
    console.log({code})
    try {
        const response = await axios.put(`${baseURL}/groups/${groupId}`, {joinCode: code});
        return response.data.joinCode;
    } catch (err) {
        return err;
    }
});

// export const updateGroup = createAsyncThunk("group/updateGroup", async(groupId, groupUpdates) => {
//     try {
//         const response = axios.put(`${baseURL}/groups/${groupId}`, groupUpdates);
//         return response.data;
//     } catch (err) {
//         return err;
//     }
// });

export const groupSlice = createSlice({
    name: "group", 
    initialState,
    reducers: {
        addActivity: (state, action) => {
            console.log(action);
            state.activity = [...state.activity, action.payload.activityId];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchGroupData.fulfilled, (state, action) => {
            state.groupId = action.payload.groupId;
            state.name = action.payload.name;
            state.memberIds = action.payload.memberIds;
            state.creator = action.payload.creator;
            state.administrators = action.payload.administrators;
            state.activity = action.payload.activity;
            state.joinCode = action.payload.joinCode;
        });
        builder.addCase(updateJoinCode.fulfilled, (state, action) => {
            console.log({joinCode: action.payload});
            state.joinCode = action.payload;
        });
    }
});

export const { addActivity } = groupSlice.actions;

export default groupSlice.reducer;