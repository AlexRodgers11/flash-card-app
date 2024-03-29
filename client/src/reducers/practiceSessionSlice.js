import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { client, shuffleArray } from "../utils";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const initialState = {
    deckIdInSetup: "",
    sessionType: "full",
    quickPracticeSelection: "random",
    quickPracticeNumCards: 1,
    filters: {
        accuracyRate: 100,
        lastPracticed: 0,
        dateCreated: 0,
        flashCard: true,
        trueFalse: true,
        multipleChoice: true
    },
    practicedSinceAttemptsPulled: false,
    cards: [],
    activeCard: {
        type: "",
        hint: "",
        question: "",
        correctAnswer: "",
        wrongAnswerOne: "",
        wrongAnswerTwo: "",
        wrongAnswerThree: ""
    },
    cardAnswered: false,
    practiceSet: [],
    missedCards: [],
    retryStatus: false,
    cardAttempts: [],
    groupDeckBelongsTo: "",
    stats: {
        numberCorrect: 0,
        numberWrong: 0
    },
    numCards: 0
}

export const fetchPracticeDeck = createAsyncThunk("practiceSession/fetchPracticeDeck", async({deckId, sessionType, options}) => {
    try {
        let queryString = "";
        if(sessionType === "quick") {
            queryString += `?sessionType=quick&criteria=${options.quickPracticeSelection}&count=${options.quickPracticeNumCards}`;
        } else if(sessionType === "filtered") {
            queryString += `?sessionType=filtered&accuracyRate=${options.accuracyRate}&lastPracticed=${options.lastPracticed}&dateCreated=${options.dateCreated}&flashCard=${options.flashCard}&trueFalse=${options.trueFalse}&multipleChoice=${options.multipleChoice}`;
        } else {
            queryString += "?sessionType=full";
        }
        const response = await client.get(`${baseURL}/decks/${deckId}/practice${queryString}`);
        const cards = response.data.cards;

        const practiceSet = shuffleArray(response.data.cards).map(card => {
            if(card.cardType === "MultipleChoiceCard") {
                card.answers = shuffleArray([card.correctAnswer, card.wrongAnswerOne, card.wrongAnswerTwo, card.wrongAnswerThree]);
                delete card.wrongAnswerOne;
                delete card.wrongAnswerTwo;
                delete card.wrongAnswerThree;
            }
            return card;
        });

        return {
            cards,
            practiceSet,
            deckId: response.data._id,
            activeCard: practiceSet.pop()
        }
    } catch(err) {
        return err;
    }
});

const saveAttempts = async (deckId, userId, cardAttempts, accuracyRate) => {
    console.log("saving attempts");
    try {
        await client.post(`${baseURL}/users/${userId}/attempts`, {
            user: userId,
            deck: deckId,
            datePracticed: Date.now(),
            cardAttempts: cardAttempts,
            accuracyRate: accuracyRate
        });
    } catch (err) {
        console.error(err);
    }
}

export const practiceDeckAgain = createAsyncThunk("practiceSession/practiceDeckAgain", async ({deckId, userId, retryStatus, cardAttempts, accuracyRate, trackSession}) => {
    if(!retryStatus && trackSession) {
        await saveAttempts(deckId, userId, cardAttempts, accuracyRate)
    }
    return [];
});

export const retryMissedCards = createAsyncThunk("practiceSession/retryMissedCards", async ({deckId, userId, retryStatus, cardAttempts, accuracyRate, trackSession}) => {
    if(!retryStatus && trackSession) {
        await saveAttempts(deckId, userId, cardAttempts, accuracyRate);
    }
    return [];
});

export const endPractice = createAsyncThunk("practiceSession/endPractice", async ({deckId, userId, retryStatus, cardAttempts, accuracyRate, trackSession}) => {
    if(!retryStatus && trackSession) {
        await saveAttempts(deckId, userId, cardAttempts, accuracyRate);
    }
    return [];
});


export const practiceSessionSlice = createSlice({
    name: "practiceSession",
    initialState,
    reducers: {
        addCardAttempt: (state, action) => {
            state.cardAttempts = [...state.cardAttempts, {
                answeredCorrectly: action.payload.answeredCorrectly, 
                cardId: action.payload.cardId,
                cardType: action.payload.cardType,
                question: action.payload.question,
                wrongAnswerSelected: action.payload.wrongAnswerSelected,
                datePracticed: action.payload.datePracticed,
                correctAnswer: action.payload.correctAnswer
            }];
            if(!action.payload.answeredCorrectly) {
                state.missedCards = [...state.missedCards, action.payload.cardId];
                state.stats.numberWrong = state.stats.numberWrong + 1;
            } else {
                state.stats.numberCorrect = state.stats.numberCorrect + 1;
            }
            let practiceSetCopy = [...state.practiceSet];
            state.activeCard = practiceSetCopy.pop();
            state.cardAnswered = false;
            state.practiceSet = practiceSetCopy;
        },
        answerCard: (state) => {
            state.cardAnswered = true;
        },
        resetPracticedSinceAttemptsPulled: (state) => {
            state.practicedSinceAttemptsPulled = false;
        },
        resetSession: (state) => {
            console.log("resetting session");
            return {...initialState, practicedSinceAttemptsPulled: true};
        },
        setDeckIdInSetup: (state, action) => {
            state.deckIdInSetup = action.payload.deckId;
            // state.groupDeckBelongsTo = "";//why have this?
        },
        setFilters: (state, action) => {
            state.filters = action.payload.filters;
        },
        setQuickPracticeNumCards: (state, action) => {
            state.quickPracticeNumCards = action.payload.numCards;
        },
        setQuickPracticeSelection: (state, action) => {
            state.quickPracticeSelection = action.payload.selection;
        },
        setPracticeDeckGroup: (state, action) => {
            state.groupDeckBelongsTo = action.payload.groupId;
        },
        setSessionType: (state, action) => {
            state.sessionType = action.payload.sessionType;
        },
        resetSessionSetupFormData: (state, action) => {
            state.deckIdInSetup = "";
            state.sessionType = "full";
            state.quickPracticeSelection = "random";
            state.quickPracticeNumCards = 1;
            state.filters = {
                accuracyRate: 100,
                lastPracticed: 0,
                dateCreated: 0,
                flashCard: true,
                trueFalse: true,
                multipleChoice: true
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(endPractice.fulfilled, () => {
            return {...initialState};
        });
        builder.addCase(fetchPracticeDeck.fulfilled, (state, action) => {
            if(action.payload.cards) {
                state.cards = action.payload.cards;
                state.numCards = action.payload.cards.length;
                state.practiceSet = action.payload.practiceSet;
                state.activeCard = action.payload.activeCard;
            }
        });
        builder.addCase(practiceDeckAgain.fulfilled, (state) => {
            let shuffledCards = shuffleArray(state.cards).map(card => {
                if(card.cardType === "MultipleChoiceCard") {
                    card.answers = shuffleArray(card.answers);
                }
                return card;
            });
            state.numCards = shuffledCards.length;
            state.activeCard = shuffledCards.pop();
            state.practiceSet = shuffledCards;
            state.missedCards = [];
            state.cardAttempts = [];
            state.stats.numberCorrect = 0;
            state.stats.numberWrong = 0;
            state.retryStatus = false;
        });
        builder.addCase(retryMissedCards.fulfilled, (state) => {
            let shuffledCards = shuffleArray(state.cards.filter(card => state.missedCards.includes(card._id)));
            state.numCards = shuffledCards.length;
            state.activeCard = shuffledCards.pop();
            state.practiceSet = shuffledCards;
            state.missedCards = [];
            state.cardAttempts = [];
            state.stats.numberCorrect = 0;
            state.stats.numberWrong = 0;
            state.retryStatus = true;
        });
    }
});

export const { addCardAttempt, answerCard, resetPracticedSinceAttemptsPulled, resetSession, setDeckIdInSetup, setFilters, setQuickPracticeNumCards, setQuickPracticeSelection, setPracticeDeckGroup, setSessionType, resetSessionSetupFormData } = practiceSessionSlice.actions;
export default practiceSessionSlice.reducer;