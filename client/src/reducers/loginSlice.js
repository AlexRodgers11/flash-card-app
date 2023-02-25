import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = "http://localhost:8000";


const initialState = {
    token: "",
    userId: "",
    login: {
        username: "",
        email: "",
    },
    name: {
        first: "",
        last: ""
    },
    email: "",
    photo: "",
    decks: [],
    groups: [],
    attempts: "",
    accountSetupStage: ""
}

export const login = createAsyncThunk("login/login", async({usernameOrEmail, password}) => {
    console.log("in login action");
    console.log({usernameOrEmail, password});
    try {
        const response = await axios.post(`${baseURL}/login`, {
            usernameOrEmail,
            password
        });
        document.cookie = `jwt=${response.data.token}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; secure; sameSite=none`;
        return {
            token: response.data.token,
            userId: response.data.userId
        }
    } catch (err) {
        return err;
    }
});

export const signUp = createAsyncThunk("login/signUp", async({email, password}) => {
    console.log("in login action");
    console.log({email, password});
    try {
        const response = await axios.post(`${baseURL}/login/new`, {
            email,
            password
        });
        console.log({data: response.data});
        document.cookie = `jwt=${response.data.token}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; secure; sameSite=none`;
        return {
            token: response.data.token,
            userId: response.data.userId,
            email: response.data.email,
            accountSetupStage: response.data.accountSetupStage
        }
    } catch (err) {
        return err;
    }
});

export const submitVerificationCode = createAsyncThunk("login/submitVerificationCode", async({userId, verificationCode}) => {
    try {
        const response = await axios.patch(`${baseURL}/users/${userId}/verification`, {code: verificationCode});
        return response.data;
    } catch (err) {
        console.error(err);
    }
});

export const fetchLoggedInUserData = createAsyncThunk("login/fetchLoggedInUserData", async (userId) => {
    try {
        const response = await axios.get(`${baseURL}/users/${userId}`);
        //need better protection here
        delete response.data.login.password;
        return response.data;
    } catch (err) {
        return err;
    }
});

export const createGroup = createAsyncThunk("login/createGroup", async({creator, name}) => {
    try {
        const response = await axios.post(`${baseURL}/users/${creator}/groups`, {creator, name, administrators: [creator], members: [creator]});
        return response.data;
    } catch (err) {}    
});

export const submitJoinCode = createAsyncThunk("login/submitJoinCode", async({userId, groupId, joinCode}) => {
    try {
        const response = await axios.post(`${baseURL}/groups/${groupId}/members/join-code`, {userId, groupId, joinCode});
        return response.data;
    } catch(err) {
        console.error(err);
        return undefined;
    }
});

export const updateUser = createAsyncThunk("login/updateUser", async ({userId, userUpdates}) => {
    try {
        const formData = new FormData();
        formData.append("email", userUpdates.login.email || "");
        formData.append("username", userUpdates.login.username);
        formData.append("first", userUpdates.name.first);
        formData.append("last", userUpdates.name.last);
        userUpdates.photo && formData.append("photo", userUpdates.photo);
        const response = await axios.patch(`${baseURL}/users/${userId}`, formData, { headers: {"Content-Type": "multipart/form-data"}});
        const stateUpdateObj = {};
        for(const key in userUpdates) {
            if(response.data.hasOwnProperty(key)) {
                stateUpdateObj[key] = response.data[key];
            }
        }
        if(response.data.accountSetupStage === "complete") {
            stateUpdateObj.accountSetupStage = response.data.accountSetupStage;
        }
        return stateUpdateObj;
    } catch (err) {}
});

export const updateProfilePic = createAsyncThunk("login/updateProfilePic", async({userId, photo}) => {
    const formData = new FormData();
    formData.append("photo", photo);
    const response = await axios.patch(`${baseURL}/users/${userId}`, formData, { headers: {"Content-Type": "multipart/form-data"}});
    console.log(response.data);
    return response.data.photo;
});

export const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        setGroups: (state, action) => {
            state.groups = action.payload;
        },
        addDeckToUser: (state, action) => {
            console.log("in addDeckToUser");
            console.log(action.payload);
            state.decks = [...state.decks, action.payload];
        },
        removeDeckFromUser: (state, action) => {
            state.decks = state.decks.filter(deck => deck._id !== action.payload.deckId)
        },
        addGroup: (state, action) => {
            state.groups = [...state.groups, action.payload.groupId];
        },
        removeGroup: (state, action) => {
            state.groups = state.groups.filter(id => id !== action.payload.groupId);
        },
        logout: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchLoggedInUserData.fulfilled, (state, action) => {
            state.userId = action.payload._id;
            state.login.username = action.payload.login.username;
            state.name = action.payload.name;
            state.login.email = action.payload.login.email;
            state.photo = action.payload.photo;
            state.decks = action.payload.decks;
            state.groups = action.payload.groups;
            state.attempts = action.payload.attempts;
            state.accountSetupStage = action.payload.accountSetupStage;
        });
        builder.addCase(createGroup.fulfilled, (state, action) => {
            state.groups = [...state.groups, action.payload];
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.token = action.payload.token;
            state.userId = action.payload.userId;
        });        
        builder.addCase(signUp.fulfilled, (state, action) => {
            state.token = action.payload.token;
            state.userId = action.payload.userId;
            state.login.email = action.payload.email;
            state.accountSetupStage = action.payload.accountSetupStage;
        });
        builder.addCase(submitVerificationCode.fulfilled, (state, action) => {
            state.accountSetupStage = action.payload.accountSetupStage;
        });
        builder.addCase(submitJoinCode.fulfilled, (state, action) => {
            state.groups = action.payload ? [...state.groups, action.payload] : [...state.groups];
        });
        builder.addCase(updateUser.fulfilled, (state, action) => {
            for(const key in action.payload) {
                console.log({key});
                if(state.hasOwnProperty(key)) {
                    state[key] = action.payload[key];
                }
            }
        });
        builder.addCase(updateProfilePic.fulfilled, (state, action) => {
            state.photo = action.payload;
        });
    }
});

export const { addDeckToUser, addGroup, logout, removeDeckFromUser, removeGroup, setGroups } = loginSlice.actions;
export default loginSlice.reducer;