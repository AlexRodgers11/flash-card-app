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

export const markNotificationsAsRead = createAsyncThunk("login/markNotificationsAsRead", async({userId}) => {
    try {
        const response = await axios.patch(`${baseURL}/users/${userId}/notifications/mark-as-read`, {});
        return response.data;
    } catch (err) {
        console.error(err.message);
    }
});

export const markMessageAsRead = createAsyncThunk("login/markMessageAsRead", async ({messageId, readerId, direction}) => {
    try {
        const response = await axios.patch(`${baseURL}/messages/${messageId}/add-to-read`, {readerId});
        console.log("response received");
        console.log({data: response.data});
        console.log({direction});
        return {...response.data, direction};
    } catch (err) {
        console.error(err.message);
    }
});

export const deleteNotification = createAsyncThunk("login/deleteNotification", async ({notificationId}) => {
    try {
        await axios.delete(`${baseURL}/notifications/${notificationId}`);
        return notificationId;
    } catch (err) {
        console.error(err.message);
    }
});

export const deleteMessage = createAsyncThunk("login/deleteMessage", async ({messageId, deletingUserId, direction}) => {
    try {
        await axios.delete(`${baseURL}/messages/${messageId}?deletingUserId=${deletingUserId}&direction=${direction}`);
        return {messageId, direction};
    } catch (err) {
        console.error(err.message);
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

export const makeDeckSubmissionDecision = createAsyncThunk("communications/makeDeckSubmissionDecision", async ({messageId, decision, comment,decidingUserId, groupId, deckId}) => {
    try {
        const response = await axios.patch(`${baseURL}/messages/${messageId}`, {decision, comment, messageType: "DeckSubmission", decidingUserId, groupId, deckId});
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

export const sendJoinRequest = createAsyncThunk("communications/sendJoinRequest", async ({userId, groupId}) => {
    try {
        const response = await axios.post(`${baseURL}/groups/${groupId}/messages/admin/join-request`, {sendingUser: userId, targetGroup: groupId});
        return response.data;
    } catch (err) {
        console.error(err);
    }
});

export const makeJoinRequestDecision = createAsyncThunk("communications/makeJoinRequestDecision", async ({messageId, decision, comment, decidingUserId}) => {
    try {
        const response = await axios.patch(`${baseURL}/messages/${messageId}`, {decision, comment, messageType: "JoinRequest", decidingUserId});
        if(!response.data.sentMessage) {
            console.log("returning the acceptance status");
            return {
                acceptanceStatus: response.data.acceptanceStatus,
            }
        } else {
            console.log("returning new sent message");
            return response.data;
        }
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