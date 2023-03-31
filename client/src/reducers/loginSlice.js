import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { client } from "../utils";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"


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
        const response = await client.patch(`${baseURL}/users/${userId}/verification`, {code: verificationCode});
        return response.data;
    } catch (err) {
        console.error(err);
    }
});

export const fetchLoggedInUserData = createAsyncThunk("login/fetchLoggedInUserData", async (userId) => {
    try {
        const response = await client.get(`${baseURL}/users/${userId}`);
        return response.data;
    } catch (err) {
        return err;
    }
});

export const copyDeck = createAsyncThunk("login/copyDeck", async ({deckId, userId}) => {
    try {
        const response = await client.post(`${baseURL}/users/${userId}/decks/copy/${deckId}`);
        return response.data;
    } catch (err) {
        console.error(err);
    }
});

export const createDeck = createAsyncThunk("login/createDeck", async ({deck, userId}) => {
    try {
        const response = await client.post(`${baseURL}/users/${userId}/decks`, deck);
        return response.data;
    } catch (err) {
        console.error(err);
    }
});

export const createGroup = createAsyncThunk("login/createGroup", async({creator, name}) => {
    try {
        const response = await client.post(`${baseURL}/users/${creator}/groups`, {creator, name, administrators: [creator], members: [creator]});
        return response.data;
    } catch (err) {
        console.error(err);
    }    
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
        const response = await client.patch(`${baseURL}/users/${userId}`, userUpdates);
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
    } catch (err) {
        console.error(err.message);
    }
});


export const updateProfilePic = createAsyncThunk("login/updateProfilePic", async({userId, photo}) => {
    const formData = new FormData();
    formData.append("photo", photo);
    const response = await client.patch(`${baseURL}/users/${userId}`, formData, { headers: {"Content-Type": "multipart/form-data"}});
    return response.data.photo;
});

export const deleteProfile = createAsyncThunk("login/deleteProfile", async({userId}) => {
    const response = await client.delete(`${baseURL}/users/${userId}`);
    console.log({data: response.data});
    if(response.data === userId) {
        return response.data;
    } else {
        console.log("id didn't match");
    }
});

export const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {
        setGroups: (state, action) => {
            state.groups = action.payload;
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
        builder.addCase(copyDeck.fulfilled, (state, action) => {
            state.decks = [...state.decks, action.payload];
        });
        builder.addCase(createDeck.fulfilled, (state, action) => {
            state.decks = [...state.decks, action.payload];
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
                if(state.hasOwnProperty(key)) {
                    state[key] = action.payload[key];
                }
            }
        });
        builder.addCase(updateProfilePic.fulfilled, (state, action) => {
            state.photo = action.payload;
        });
        builder.addCase(deleteProfile.fulfilled, (state, action) => {
            return initialState;
        });
    }
});

export const { addGroup, logout, removeDeckFromUser, removeGroup, setGroups } = loginSlice.actions;
export default loginSlice.reducer;