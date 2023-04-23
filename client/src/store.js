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
    whitelist: ["accountSetupStage", "login.username", "decks", "photo", "name", "userId", "privacy", "communicationSettings"]
}

const persistedLoginReducer = persistReducer(loginPersistConfig, loginReducer);

const communicationsPersistConfig = {
    key: "communications",
    storage: storage
}

const persistedCommunicationsReducer = persistReducer(communicationsPersistConfig, communicationsReducer);

const practiceSessionPersistConfig = {
    key: "practiceSession",
    storage: storage
}

const persistedPracticeSessionReducer = persistReducer(practiceSessionPersistConfig, practiceSessionReducer);

const combinedReducer = combineReducers(
    {
        attempts: attemptReducer,
        communications: persistedCommunicationsReducer,
        deck: deckReducer,
        decks: decksReducer,
        group: groupReducer,
        login: persistedLoginReducer,
        practiceSession: persistedPracticeSessionReducer
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
