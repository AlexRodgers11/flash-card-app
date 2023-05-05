import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router';
import { endPractice, fetchPracticeDeck, practiceDeckAgain, resetSession, retryMissedCards } from '../reducers/practiceSessionSlice';
import FlashCard from "./FlashCard";
import MultipleChoiceCard from "./MultipleChoiceCard";
import TrueFalseCard from "./TrueFalseCard";
import { store } from '../store';
import styled from 'styled-components';

const createCard = (type) => {
    switch(type) {
        case 'FlashCard': 
            return <FlashCard />
        case 'TrueFalseCard':
            return <TrueFalseCard />
        case 'MultipleChoiceCard':
            return <MultipleChoiceCard />
        default:
            console.error("createCard function passed an invalid argument");
    }
}

const PracticeSessionWrapper = styled.div`
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    // justify-content: center; 
    width: 100%; 
    height: 100%;
    background-color: #9DE59D;



    // background-color: #8EE18E;
    // background-color: #7EDD7E;

    // background-color: #0E958F;
    // background-color: #10A8A0;
    min-height: calc(100vh - 5.5rem);
`

const CardWrapper = styled.div`
    border: 3px solid black; 
    overflow: hidden;
    // border-radius: 3rem;
    border-radius: 10%;
    // background-color: white;
    background-color: #2C262C;
    width: 28em;
    height: 32em;
    min-height: 20em;
    // margin-bottom: 10rem;
    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
`


const StatsColumn = styled.div`
    display: flex; 
    flex-direction: column; 
    justify-content: center;
    align-items: center; 
    border: 1px solid black;
`

const StatsRow = styled.div`
    height: 5rem;
    // color: white;
    color: #FAF9FA;
    font-size: 1.5rem;
    font-weight: 600;
    & h3 {
        font-size: 1.75rem;
        font-weight: 700;
    }
    & .col {
        // margin: 0 .15rem;
        margin: 0 .5rem;
        // background-color: white;
        // background-color: #F0F600;
        // background-color: #F6F4F6;
        // background-color: #FAF9FA;
        // background-color: #211C21;
        background-color: #2C262C;
        border: 3px solid black;
        &.correct {
            // background-color: blue;
            color: #FAF9FA;
            // color: white;
            background-color: #333FFF;
            // background-color: #1F1FFF
            
        }
        &.incorrect {
            // background-color: red;
            background-color: #FF3333;
            // background-color: #FF1F1F;
        }
        &.accuracy-rate {
            // color: black;
            // background-color: #198754;
        }
        &.cards-left {
            // color: black;
            // background-color: #212529
        }
    }
`

const StatsWrapper = styled.div`
    margin: 5rem; 
    max-width: 45rem;
`

const WrapUpButtonsContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    padding: 6rem 0;
    & button {
        width: 50%;
    }
`;

function PracticeSession() {
    let { deckId } = useParams();
    const activeCard = useSelector((state) => state.practiceSession.activeCard);
    const stats = useSelector((state) => state.practiceSession.stats);
    const numCards = useSelector((state) => state.practiceSession.numCards);
    const groupDeckBelongsTo = useSelector((state) => state.practiceSession.groupDeckBelongsTo);
    const statisticsTracking = useSelector((state) => state.login.statisticsTracking);
    const retryStatus = useSelector((state) => state.practiceSession.retryStatus);
    const loggedInUserId = useSelector((state) => state.login.userId);
    const userDeckIds = useSelector((state) => state.login.decks.map((deck) => deck._id));
    const userGroupIds = useSelector((state) => state.login.groups);
    const sessionType = useSelector((state) => state.practiceSession.sessionType);
    const quickPracticeSelection = useSelector((state) => state.practiceSession.quickPracticeSelection);
    const quickPracticeNumCards = useSelector((state) => state.practiceSession.quickPracticeNumCards);
    const filters = useSelector((state) => state.practiceSession.filters);
    const deckIdInSetup = useSelector((state) => state.practiceSession.deckIdInSetup);
    let dispatch = useDispatch();
    let navigate = useNavigate();
    
    useEffect(() => {
        if((deckIdInSetup === deckId && (!activeCard?.cardType)) && ((stats.numberCorrect + stats.numberWrong) !== numCards || numCards === 0)) {
            const options = {
                ...(sessionType === "quick" && {
                    quickPracticeSelection,
                    quickPracticeNumCards
                }),
                ...(sessionType === "filtered" && filters)
            }
            dispatch(fetchPracticeDeck({deckId: deckId, sessionType: sessionType, options: options}))
                .then(response => {
                    const statusCode = response?.payload?.response?.status
                    if(statusCode === 400) {
                        alert("This deck doesn't have any cards. Redirecting to Dashboard");
                        navigate("/dashboard");
                    } else if(statusCode === 401) {
                        navigate("/dashboard");
                    }
                })
        } 
    }, [activeCard, deckId, deckIdInSetup, dispatch, filters, quickPracticeNumCards, quickPracticeSelection, sessionType, navigate, numCards, stats]);
    
    useEffect(() => {
        return () => {
            console.log("resetting session");
            localStorage.removeItem("persist:practiceSession");
            dispatch(resetSession());
        }
    }, [dispatch]);

    const sessionShouldBeSaved = async (deckType, statsPreference) => {
        if(!userDeckIds.includes(deckId) && !userGroupIds.includes(groupDeckBelongsTo)) {
            return false;
        }
    
        if(deckType === "user") {
            return statsPreference === "all" || statsPreference === "user-only";
        } else if (deckType === "group") {
            return statsPreference === "all" || statsPreference === "group-only";
        } else {
            console.log("incorrect deck type selected");
            return false;
        }
    }
    const handlePracticeDeckAgain = async () => {
        const cardAttempts = store.getState().practiceSession.cardAttempts;
        dispatch(practiceDeckAgain({deckId, userId: loggedInUserId, retryStatus, cardAttempts, accuracyRate: (stats.numberCorrect / (stats.numberCorrect + stats.numberWrong)) * 100, trackSession: await sessionShouldBeSaved(groupDeckBelongsTo ? "group" : "user", statisticsTracking)}));
    }
    
    const handleRetryMissedCards = async () => {
        const cardAttempts = store.getState().practiceSession.cardAttempts;
        dispatch(retryMissedCards({deckId, userId: loggedInUserId, retryStatus, cardAttempts, accuracyRate: (stats.numberCorrect / (stats.numberCorrect + stats.numberWrong)) * 100, trackSession: await sessionShouldBeSaved(groupDeckBelongsTo ? "group" : "user", statisticsTracking)}));
    }

    const navigateAway = async (evt) => {
        const cardAttempts = store.getState().practiceSession.cardAttempts;
        dispatch(endPractice({deckId, userId: loggedInUserId, retryStatus, cardAttempts, accuracyRate: (stats.numberCorrect / (stats.numberCorrect + stats.numberWrong)) * 100, trackSession: await sessionShouldBeSaved(groupDeckBelongsTo ? "group" : "user", statisticsTracking)}))
            .then(() => {
                if(evt.target.value === "dashboard") {
                    navigate("/dashboard");
                } else {
                    navigate(`/users/${loggedInUserId}/practice`);
                }
            });
    }

    return (
        <PracticeSessionWrapper>
            <StatsWrapper className="container">
                <StatsRow className="row">
                    <StatsColumn className="col correct">
                        <h3>Correct</h3>
                        <p>{stats.numberCorrect || 0}</p>
                    </StatsColumn>
                    <StatsColumn className="col incorrect">
                        <h3>Incorrect</h3>
                        <p>{stats.numberWrong || 0}</p>
                    </StatsColumn>
                    <StatsColumn className="col accuracy-rate">
                        <h3>Accuracy Rate</h3>
                        <p>{stats.numberCorrect || stats.numberWrong ? (stats.numberCorrect * 100 / (stats.numberCorrect + stats.numberWrong)).toFixed() + "%" : "0%"}</p>
                    </StatsColumn>
                    <StatsColumn className="col cards-left">
                        <h3>Cards Left</h3>
                        <p>{numCards - (stats.numberCorrect + stats.numberWrong)}</p>
                    </StatsColumn>
                </StatsRow>
            </StatsWrapper>
            <CardWrapper>
                {activeCard?.cardType ? 
                    createCard(activeCard.cardType) 
                    : 
                    <WrapUpButtonsContainer>
                        <button className="btn btn-lg btn-dark" onClick={handlePracticeDeckAgain}>Practice Deck Again</button>
                        {stats.numberWrong ? 
                            <button className="btn btn-lg btn-dark" onClick={handleRetryMissedCards}>Retry Missed Cards</button>
                            :
                            null
                        }
                        <button className="btn btn-lg btn-dark" value="practice" onClick={navigateAway}>Select Another Deck</button>
                        <button className="btn btn-lg btn-dark" value="dashboard" onClick={navigateAway}>Home</button>
                    </WrapUpButtonsContainer>
                }
            </CardWrapper>
        </PracticeSessionWrapper>
    )
}

export default PracticeSession