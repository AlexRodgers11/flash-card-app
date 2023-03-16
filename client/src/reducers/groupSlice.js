import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { client } from "../utils";

const baseURL = "http://localhost:8000";

const initialState = {
    groupId: "",
    name: "",
    memberIds: [],
    creator: "",
    headAdmin: "",
    administrators: [],
    activities: [],
    joinOptions: "",
    joinCode: ""
};

//need to ad this to Group component
export const deleteGroup = createAsyncThunk("group/deleteGroup", async ({groupId}) => {
    try {
        //maybe create separate admin auth token and send that instead of id
        const response = await client.delete(`${baseURL}/groups/${groupId}`);
        return response.data;
    } catch (err) {
        console.error(err);
        return err;
    }
});

export const fetchGroupData = createAsyncThunk("group/fetchGroupData", async ({groupId}) => {
    console.log("fetching group data");
    try {
        const response = await client.get(`${baseURL}/groups/${groupId}`);
        console.log({response});
        return {
            groupId: response.data._id,
            name: response.data.name,
            creator: response.data.creator,
            administrators: response.data.administrators,
            headAdmin: response.data.administrators[0],
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

export const grantAdminAuthority = createAsyncThunk("group/grantAdminAuthority", async ({groupId, memberToAuthorizeId}) => {
    try {
        const response = await client.patch(`${baseURL}/groups/${groupId}/admins`, {groupId, memberId: memberToAuthorizeId, action: "grant"});
        // return response.data;
        console.log({response: response.data})
        return {userId: response.data.userId, memberIds: response.data.members};
    } catch (err) {
        console.error(err);
        return err;
    }
});

export const revokeAdminAuthority = createAsyncThunk("group/revokeAdminAuthority", async ({groupId, memberToDeauthorizeId}) => {
    try {
        const response = await client.patch(`${baseURL}/groups/${groupId}/admins`, {groupId, memberId: memberToDeauthorizeId, action: "revoke"});
        // return response.data;
        console.log({response: response.data})
        return {userId: response.data.userId, memberIds: response.data.members};
    } catch (err) {
        console.error(err);
        return err;
    }
});

export const removeMember = createAsyncThunk("group/removeMember", async({groupId, memberToRemoveId}) => {
    try {
        const response = await client.patch(`${baseURL}/groups/${groupId}/members`, {memberToRemoveId});
        return response.data;
    } catch (err) {
        console.error(err);
        return err;
    }
});

export const replaceHeadAdmin = createAsyncThunk("group/replaceHeadAdmin", async({groupId, newAdminId}) => {
    try {
        const response = await client.patch(`${baseURL}/groups/${groupId}/head-admin`, {newAdminId});
        return {
            administrators: response.data.administrators,
            members: response.data.members,
            headAdmin: response.data.administrators[0]
        }
    } catch (err) {
        console.error(err);
        return err;
    }
});

export const updateGroup = createAsyncThunk("group/updateGroup", async({groupId, groupUpdates}) => {
    try {
        const response = await client.patch(`${baseURL}/groups/${groupId}`, groupUpdates);
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
            state.headAdmin = action.payload.headAdmin;
            state.administrators = action.payload.administrators;
            state.activities = action.payload.activities;
            state.joinOptions = action.payload.joinOptions;
            state.joinCode = action.payload.joinCode;
        });
        builder.addCase(deleteGroup.fulfilled, (state) => {
            state.groupId = "";
            state.name = "";
            state.memberIds = [];
            state.creator = "";
            state.headAdmin = "";
            state.administrators = [];
            state.activities = [];
            state.joinOptions = "invite";
            state.joinCode = undefined;
        });
        builder.addCase(fetchGroupJoinOptions.fulfilled, (state, action) => {
            state.joinOptions = action.payload.joinOptions;
        });
        builder.addCase(grantAdminAuthority.fulfilled, (state, action) => {
            console.log({payload: action.payload});
            state.administrators = [...state.administrators, action.payload.userId];
            state.memberIds = action.payload.memberIds;
        });
        builder.addCase(revokeAdminAuthority.fulfilled, (state, action) => {
            console.log({payload: action.payload});
            state.administrators = state.administrators.filter(adminId => adminId !== action.payload.userId);
            state.memberIds = action.payload.memberIds;
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
        builder.addCase(replaceHeadAdmin.fulfilled, (state, action) => {
            state.memberIds = action.payload.members;
            state.administrators = action.payload.administrators;
            state.headAdmin = action.payload.headAdmin;
        });
    }
});

export const { addActivity, addMember } = groupSlice.actions;

export default groupSlice.reducer;