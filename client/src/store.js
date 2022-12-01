import { combineReducers, configureStore } from "@reduxjs/toolkit";
import deckReducer from "./reducers/deckSlice";
import decksReducer from "./reducers/decksSlice";
import groupReducer from "./reducers/groupSlice";
import loginReducer from "./reducers/loginSlice";
import practiceSessionReducer from "./reducers/practiceSessionSlice";

const combinedReducer = combineReducers(
    {
        deck: deckReducer,
        decks: decksReducer,
        group: groupReducer,
        login: loginReducer,
        practiceSession: practiceSessionReducer
    }
);

const rootReducer = (state, action) => {
    if(action.type === "login/logout") {
        state = undefined;
    }
    return combinedReducer(state, action);
}

export const store = configureStore({
    reducer: rootReducer
});