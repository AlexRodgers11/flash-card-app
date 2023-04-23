import { combineReducers, configureStore } from "@reduxjs/toolkit";
import attemptReducer from "./reducers/attemptsSlice";
import communicationsReducer from "./reducers/communicationsSlice";
import deckReducer from "./reducers/deckSlice";
import decksReducer from "./reducers/decksSlice";
import groupReducer from "./reducers/groupSlice";
import loginReducer from "./reducers/loginSlice";
import practiceSessionReducer from "./reducers/practiceSessionSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const loginPersistConfig = {
    key: "login",
    storage: storage,
    whitelist: ["accountSetupStage", "login.username", "photo", "name", "userId", "privacy", "communicationSettings"]
}

const persistedLoginReducer = persistReducer(loginPersistConfig, loginReducer);

const combinedReducer = combineReducers(
    {
        attempts: attemptReducer,
        communications: communicationsReducer,
        deck: deckReducer,
        decks: decksReducer,
        group: groupReducer,
        login: persistedLoginReducer,
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

export const persistor = persistStore(store);
