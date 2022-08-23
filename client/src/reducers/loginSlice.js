import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = "http://localhost:8000";


const initialState = {
    token: "",
    userId: "",
    username: "",
    name: {},
    email: "",
    photo: "",
    decks: "",
    groups: "",
    attempts: ""
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

export const fetchLoggedInUserData = createAsyncThunk("login/fetchLoggedInUserData", async (userId) => {
    try {
        const response = await axios.get(`${baseURL}/users/${userId}`);
        delete response.data.login.password;
        return response.data;
        // return {
        //     username: response.login.username,
        //     name: {
        //         first: response.name.first,
        //         last: response.name.last
        //     },
        //     email: response.email,
        //     photo: response.photo,
        //     decks: response.decks,
        //     groups: response.groups,
        //     attempts: response.attempts
        // }
    } catch (err) {
        return err;
    }
});

export const loginSlice = createSlice({
    name: "login",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchLoggedInUserData.fulfilled, (state, action) => {
            // state.userId = action.payload._id;
            state.username = action.payload.login.username;
            state.name = action.payload.name;
            state.email = action.payload.email;
            state.photo = action.payload.photo;
            state.decks = action.payload.decks;
            state.groups = action.payload.groups;
            state.attempts = action.payload.attempts;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.token = action.payload.token;
            state.userId = action.payload.userId
        });
        builder.addCase(signUp.fulfilled, (state, action) => {
            state.token = action.payload.token;
            state.userId = action.payload.userId;
            state.email = action.payload.email;
        });
    }
});

export default loginSlice.reducer;