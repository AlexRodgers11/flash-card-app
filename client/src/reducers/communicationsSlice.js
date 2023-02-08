import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { client } from "../utils";

const baseURL = "http://localhost:8000";

const initialState = {
    messages: {
        sent: [],
        received: []
    },
    notifications: [],
}

export const fetchCommunications = createAsyncThunk("communications/fetchCommunications", async ({userId}) => {
    try {
        const response = await client.get(`${baseURL}/communications`);
        return {
            messages: response.data.messages, 
            notifications: response.data.notifications
        }
    } catch (err) {
        console.error(err)
    }    
});

export const markNotificationsAsRead = createAsyncThunk("communications/markNotificationsAsRead", async({userId}) => {
    try {
        const response = await client.patch(`${baseURL}/notifications/mark-as-read`, {});
        return response.data;
    } catch (err) {
        console.error(err.message);
    }
});

export const markMessageAsRead = createAsyncThunk("communications/markMessageAsRead", async ({messageId, readerId, direction}) => {
    try {
        const response = await client.patch(`${baseURL}/messages/${messageId}/add-to-read`, {readerId});
        return {...response.data, direction};
    } catch (err) {
        console.error(err.message);
    }
});

export const deleteNotification = createAsyncThunk("communications/deleteNotification", async ({notificationId}) => {
    try {
        await client.delete(`${baseURL}/notifications/${notificationId}`);
        return notificationId;
    } catch (err) {
        console.error(err.message);
    }
});

export const deleteMessage = createAsyncThunk("communications/deleteMessage", async ({messageId, direction}) => {
    try {
        await client.delete(`${baseURL}/messages/${messageId}?direction=${direction}`);
        return {messageId, direction};
    } catch (err) {
        console.error(err.message);
    }
});

export const submitDeck = createAsyncThunk("communications/submitDeck", async ({groupId, deckId}) => {
    try {
        let messageData = {
            targetGroup: groupId,
            deckToCopy: deckId
        }
        const response = await client.post(`${baseURL}/groups/${groupId}/messages/admin/deck-submission`, messageData);
        console.log({response});
        return response.data;
    } catch (err) {
        console.error(err)
    }
}); 

export const makeDeckSubmissionDecision = createAsyncThunk("communications/makeDeckSubmissionDecision", async ({messageId, decision, comment}) => {
    try {
        const response = await client.patch(`${baseURL}/messages/${messageId}`, {decision, comment, messageType: "DeckSubmission"});   

            return response.data;

    } catch (err) {
        console.log({err});
        return err.response.data;
    }
});


export const sendJoinRequest = createAsyncThunk("communications/sendJoinRequest", async ({groupId}) => {
    try {
        const response = await client.post(`${baseURL}/groups/${groupId}/messages/admin/join-request`, {targetGroup: groupId});
        return response.data;
    } catch (err) {
        console.error(err);
    }
});

export const makeJoinRequestDecision = createAsyncThunk("communications/makeJoinRequestDecision", async ({messageId, decision, comment}) => {
    try {
        const response = await client.patch(`${baseURL}/messages/${messageId}`, {decision, comment, messageType: "JoinRequest"});
            return response.data;
    } catch (err) {
        console.error(err);
        return err.response.data;
    }
});

export const communicationsSlice = createSlice({
    name: "communications",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(fetchCommunications.fulfilled, (state, action) => {
            state.messages.received = action.payload.messages.received;
            state.messages.sent = action.payload.messages.sent;
            state.notifications = action.payload.notifications;
        });
        builder.addCase(markNotificationsAsRead.fulfilled, (state, action) => {
            state.notifications = action.payload;
        });
        builder.addCase(markMessageAsRead.fulfilled, (state, action) => {
            console.log({payload: action.payload});
            state.messages[action.payload.direction] = state.messages[action.payload.direction].map(message => {
                if(message._id === action.payload.messageId) {
                    return {...message, read: action.payload.read}
                }
                return message;
            });
        });
        builder.addCase(deleteNotification.fulfilled, (state, action) => {
            state.notifications = state.notifications.filter(notification => notification._id !== action.payload);
        });
        builder.addCase(deleteMessage.fulfilled, (state, action) => {
            state.messages[action.payload.direction] = state.messages[action.payload.direction].filter(message => message._id !== action.payload.messageId);
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
        builder.addCase(sendJoinRequest.fulfilled, (state, action) => {
            state.messages.sent = [...state.messages.sent, action.payload];
        });
        builder.addCase(makeJoinRequestDecision.fulfilled, (state, action) => {
            console.log({payload: action.payload});
            if(action.payload.sentMessage) {
                state.messages.sent = [...state.messages.sent, action.payload.sentMessage];
            }
        })
    }
});

export default communicationsSlice.reducer;