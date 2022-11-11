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
    joinOptions: "",
    joinCode: ""
};

// export const addMember = createAsyncThunk("group/addMember", async({groupId, userId}) => {
//     try {
//         const response = await axios.post(`${baseURL}/groups/${groupId}/members`, {userId});
//         return {
//             memberId: response.data,
//         }
//     } catch (err) {
//         console.error(err);
//         return err;
//     }
// });

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
            joinOptions: response.data.joinOptions,
            joinCode: response.data.joinCode
        }
    } catch (err) {
        return err;
    }
});

export const fetchGroupJoinOptions = createAsyncThunk("group/fetchGroupJoinOptions", async({groupId}) => {
    try {
        const response = await axios.get(`${baseURL}/groups/${groupId}/join-options`);
        return response.data;
    } catch (err) {
        console.error(err);
        return err;
    }
});

export const removeMember = createAsyncThunk("group/removeMember", async({groupId, memberToRemoveId, requesterId}) => {
    try {
        const response = await axios.patch(`${baseURL}/groups/${groupId}/members`, {memberToRemoveId, requesterId});
        return response.data;
    } catch (err) {
        console.error(err);
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
            if(action.payload.groupId === state.groupId) {
                state.memberIds = [...state.memberIds, action.payload.userId];
            }
        }
    },
    extraReducers: (builder) => {
        // builder.addCase(addMember.fulfilled, (state, action) => {
        //     state.memberIds = [...state.memberIds, action.payload.memberId];
        // });
        builder.addCase(fetchGroupData.fulfilled, (state, action) => {
            state.groupId = action.payload.groupId;
            state.name = action.payload.name;
            state.memberIds = action.payload.memberIds;
            state.creator = action.payload.creator;
            state.administrators = action.payload.administrators;
            state.activities = action.payload.activities;
            state.joinOptions = action.payload.joinOptions;
            state.joinCode = action.payload.joinCode;
        });
        builder.addCase(fetchGroupJoinOptions.fulfilled, (state, action) => {
            state.joinOptions = action.payload.joinOptions;
        });
        builder.addCase(updateGroup.fulfilled, (state, action) => {
            for(const key in action.payload) {
                if(initialState.hasOwnProperty(key)) {
                    state[key] = action.payload[key];
                }
            }
        });
        builder.addCase(removeMember.fulfilled, (state, action) => {
            state.memberIds = state.memberIds.filter(id => id !== action.payload);
            state.administrators = state.administrators.filter(id => id !== action.payload);
        });
    }
});

export const { addActivity, addMember } = groupSlice.actions;

export default groupSlice.reducer;