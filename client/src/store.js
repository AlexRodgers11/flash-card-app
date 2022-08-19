import { configureStore } from "@reduxjs/toolkit";
import deckReducer from "./reducers/deckSlice";
import decksReducer from "./reducers/decksSlice";
import groupReducer from "./reducers/groupSlice";

export const store = configureStore({
    reducer: {
        deck: deckReducer,
        decks: decksReducer,
        group: groupReducer,
    }
});