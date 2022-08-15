import { configureStore } from "@reduxjs/toolkit";
import decksReducer from "./reducers/decksSlice";

export const store = configureStore({
    reducer: {
        decks: decksReducer
    }
});