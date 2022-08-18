import { configureStore } from "@reduxjs/toolkit";
import decksReducer from "./reducers/decksSlice";
import groupReducer from "./reducers/groupSlice";

export const store = configureStore({
    reducer: {
        deck: decksReducer,
        decks: decksReducer,
        group: groupReducer,
    }
});