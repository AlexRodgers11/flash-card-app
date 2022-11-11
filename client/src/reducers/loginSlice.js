import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = "http://localhost:8000";


const initialState = {
    token: "",
    userId: "",
    login: {
        username: "",
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
    messages: {
        sent: [],
        received: [], 
    },
    notifications: []
}

export const login = createAsyncThunk("login/login", async({usernameOrEmail, password}) => {
    console.log("in login action");
    console.log({usernameOrEmail, password});
    try {
        const response = await axios.post(`${baseURL}/login`, {
            usernameOrEmail,
            password
        });
        return {
            token: response.data.token,
            userId: response.data.userId,
            email: response.data.email
        }
    } catch (err) {
        return err;
    }
});

export const markNotificationsAsRead = createAsyncThunk("login/markNotificationsAsRead", async() => {
    console.log("in mark notifications as read");
    try {
        const response = await axios.put(`${baseURL}/users/notifications`, {});
        return response.data.notifications;
    } catch (err) {
        console.error(err);
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
        return {
            token: response.data.token,
            userId: response.data.userId,
            email: response.data.email
        }
    } catch (err) {
        return err;
    }
});

export const setIdentificationData = createAsyncThunk("login/setIdentificationData", async({userId, username, firstName, lastName, photo}) => {
    console.log("updating user info");
    try {
        const response = await axios.put(`${baseURL}/users/${userId}`, {
            login: {
                username: username
            },
            name: {
                first: firstName,
                last: lastName
            },
            photo: photo
        });
        return response.data;
    } catch (err) {
        return err;
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

export const addGroup = createAsyncThunk("login/addGroup", async({creator, name}) => {
    try {
        const response = await axios.post(`${baseURL}/users/${creator}/groups`, {creator, name, administrators: [creator], members: [creator]});
        return response.data;
    } catch (err) {}    
});

export const sendJoinRequest = createAsyncThunk("login/sendJoinRequest", async({userId, groupId}) => {
    try {
        const response = await axios.post(`${baseURL}/groups/${groupId}/messages/admin/join-request`, {sendingUser: userId, targetGroup: groupId});
        return response.data;
    } catch(err) {
        console.error(err);
        return err;
    }
});

export const submitJoinCode = createAsyncThunk("login/submitJoinCode", async({userId, groupId, joinCode}) => {
    try {
         const response = await axios.post(`${baseURL}/groups/${groupId}/members/join-code`, {userId, groupId, joinCode});
         return response.data;
    } catch(err) {
        console.error(err);
        return err;
    }
});

export const updateUser = createAsyncThunk("login/updateUser", async ({userId, userUpdates}) => {
    try {
        const formData = new FormData();
        formData.append("email", userUpdates.login.email || "");
        formData.append("username", userUpdates.login.username);
        formData.append("first", userUpdates.name.first);
        formData.append("last", userUpdates.name.last);
        formData.append("photo", userUpdates.photo);
        const response = await axios.patch(`${baseURL}/users/${userId}`, formData, { headers: {"Content-Type": "multipart/form-data"}});
        const stateUpdateObj = {};
        for(const key in userUpdates) {
            if(response.data.hasOwnProperty(key)) {
                stateUpdateObj[key] = response.data[key];
            }
        }
        return stateUpdateObj;
    } catch (err) {}
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
            state.decks = [...state.decks, action.payload] ;
        },
        addMessage: (state, action) => {
            state.messages[action.payload.direction].push(action.payload.message);
        },
        editMessage: (state, action) => {
            state.messages[action.payload.direction].map(message => {
                if(message._id === action.payload.message._id) {
                    return action.payload.message;
                }
                return message;
            });
        },
        leaveGroup: (state, action) => {
            state.groups = state.groups.filter(id => id !== action.payload.groupId);
        },
        logout: (state) => initialState
    },
    extraReducers: (builder) => {
        builder.addCase(fetchLoggedInUserData.fulfilled, (state, action) => {
            state.userId = action.payload._id;
            state.login.username = action.payload.login.username;
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.photo = action.payload.photo;
            state.decks = action.payload.decks;
            state.groups = action.payload.groups;
            state.attempts = action.payload.attempts;
            state.messages.received = action.payload.messages.received;
            state.messages.sent = action.payload.messages.sent;
            state.notifications = action.payload.notifications;
        });
        builder.addCase(addGroup.fulfilled, (state, action) => {
            state.groups = [...state.groups, action.payload];
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.token = action.payload.token;
            state.userId = action.payload.userId
        });
        builder.addCase(markNotificationsAsRead, (state, action) => {
            state.notifications = action.payload;
        });
        builder.addCase(signUp.fulfilled, (state, action) => {
            state.token = action.payload.token;
            state.userId = action.payload.userId;
            state.email = action.payload.email;
        });
        builder.addCase(sendJoinRequest.fulfilled, (state, action) => {
            state.messages.sent = [...state.messages.sent, action.payload];
        });
        builder.addCase(setIdentificationData.fulfilled, (state, action) => {
            state.username = action.payload.username;
            state.name = action.payload.name;
            state.photo = action.payload.photo;
        });
        builder.addCase(submitJoinCode.fulfilled, (state, action) => {
            state.groups = [...state.groups, action.payload];
        });
        builder.addCase(updateUser.fulfilled, (state, action) => {
            for(const key in action.payload) {
                console.log({key});
                if(state.hasOwnProperty(key)) {
                    state[key] = action.payload[key];
                }
            }
        });
    }
});

export const { addDeckToUser, addMessage, editMessage, leaveGroup, logout, setGroups } = loginSlice.actions;
export default loginSlice.reducer;