import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const baseURL = "http://localhost:8000";

const initialState = {
    messages: {
        sent: [],
        received: []
    },
    notifications: [],
}

export const fetchCommunications = createAsyncThunk("communications/fetchCommunications", async ({userId}) => {
    //send request to notifications route
    //send request to messages route
    try {
        const response = await axios.get(`${baseURL}/users/${userId}/communications`);
        console.log({response});

        return {
            messages: response.data.messages, 
            notifications: response.data.notifications
        }
    } catch (err) {
        console.error(err)
    }    
});

export const submitDeck = createAsyncThunk("communications/submitDeck", async ({userId, groupId, deckId}) => {
    try {
        let messageData = {
            sendingUser: userId,
            targetGroup: groupId,
            deckToCopy: deckId
        }
        const response = await axios.post(`${baseURL}/groups/${groupId}/messages/admin/deck-submission`, messageData);
        console.log({response});
        return response.data;
    } catch (err) {
        console.error(err)
    }
}); 

//sent when an admin decides whether to approve or deny a request to add a deck to the group
export const makeDeckSubmissionDecision = createAsyncThunk("communications/makeDeckSubmissionDecision", async ({messageId, decision, comment,decidingUserId, groupId, deckId}) => {
    try {
        const response = await axios.patch(`${baseURL}/messages/${messageId}`, {decision, comment, messageType: "DeckDecision", decidingUserId, groupId, deckId});
        console.log({response});

        if(!response.data.sentMessage) {
            return {
                acceptanceStatus: response.data.acceptanceStatus,
                deckName: response.data.deckName,
                ...(response.data.deckId && {deckId: response.data.deckId})
            }
        } else {
            return response.data;
        }

    } catch (err) {
        console.error(err)
    }
});

export const sendJoinRequest = createAsyncThunk("communications/sendJoinRequest", async ({sendingUser: userId, targetGroup: groupId}) => {
    try {
        // axios.
    } catch (err) {
        console.error(err)
    }
});

export const makeJoinRequestDecision = createAsyncThunk("communications/makeJoinRequestDecision", async ({messageId, decision, comment, messageType, decidingUserId}) => {
    try {
        // axios.
    } catch (err) {
        console.error(err)
    }
});

export const communicationsSlice = createSlice({
    name: "communications",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(fetchCommunications.fulfilled, (state, action) => {
            console.log(action.payload.messages.received);
            state.messages.received = action.payload.messages.received;
            // state.messages.received = [...action.payload.messages.received];
            state.messages.sent = action.payload.messages.sent;
            state.notifications = action.payload.notifications;
        });
        builder.addCase(submitDeck.fulfilled, (state, action) => {
            state.messages.sent = [...state.messages.sent, action.payload]
        });
        builder.addCase(makeDeckSubmissionDecision.fulfilled, (state, action) => {
            console.log({payload: action.payload});
            if(action.payload.sentMessage) {
                state.messages.sent = [...state.messages.sent, action.payload.sentMessage];
            }
        });
    }
});

export default communicationsSlice.reducer;