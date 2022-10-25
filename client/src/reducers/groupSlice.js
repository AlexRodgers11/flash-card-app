import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = "http://localhost:8000";

const initialState = {
    groupId: "",
    name: "",
    memberIds: [],
    creator: "",
    administrators: [],
    activities: [],
    allowJoinWithCode: false,
    joinCode: ""
};

//possibly add private property to group (classroom would default to private)
export const fetchGroupData = createAsyncThunk("group/fetchGroupData", async ({groupId, userId}) => {
    try {
        const response = await axios.get(`${baseURL}/groups/${groupId}?requestingUser=${userId}`);
        return {
            groupId: response.data._id,
            name: response.data.name,
            creator: response.data.creator,
            administrators: response.data.administrators,
            memberIds: [...response.data.members],
            activities: response.data.activities,
            joinCode: response.data.joinCode,
            allowJoinWithCode: response.data.allowJoinWithCode
        }
    } catch (err) {
        return err;
    }
});

export const updateGroup = createAsyncThunk("group/updateGroup", async({groupId, groupUpdates}) => {
    try {
        const response = await axios.put(`${baseURL}/groups/${groupId}`, groupUpdates);
        let stateUpdateObj = {};
        for(const key in groupUpdates) {
            if(response.data.hasOwnProperty(key)) {
            stateUpdateObj[key] = response.data[key];
            }
        }
        return stateUpdateObj;
    } catch (err) {
        return err;
    }
});

export const groupSlice = createSlice({
    name: "group", 
    initialState,
    reducers: {
        addActivity: (state, action) => {
            if(action.payload.groupId === state.groupId) {
                state.activities = [...state.activities, action.payload.activityId];
            }
        },
        addMember: (state, action) => {
            state.memberIds = [...state.memberIds, action.payload.user._id];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchGroupData.fulfilled, (state, action) => {
            state.groupId = action.payload.groupId;
            state.name = action.payload.name;
            state.memberIds = action.payload.memberIds;
            state.creator = action.payload.creator;
            state.administrators = action.payload.administrators;
            state.activities = action.payload.activities;
            state.allowJoinWithCode = action.payload.allowJoinWithCode;
            state.joinCode = action.payload.joinCode;
        });
        builder.addCase(updateGroup.fulfilled, (state, action) => {
            for(const key in action.payload) {
                if(initialState.hasOwnProperty(key)) {
                    state[key] = action.payload[key];
                }
            }
        });
    }
});

export const { addActivity, addMember } = groupSlice.actions;

export default groupSlice.reducer;