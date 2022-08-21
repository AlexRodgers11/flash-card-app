import { configureStore } from "@reduxjs/toolkit";
import deckReducer from "./reducers/deckSlice";
import decksReducer from "./reducers/decksSlice";
import groupReducer from "./reducers/groupSlice";
import loginReducer from "./reducers/loginSlice";

export const store = configureStore({
    reducer: {
        deck: deckReducer,
        decks: decksReducer,
        group: groupReducer,
        login: loginReducer
    }
});