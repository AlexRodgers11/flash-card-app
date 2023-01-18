import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router';
import { endPractice, fetchDeck, practiceDeckAgain, resetSession, retryMissedCards } from '../reducers/practiceSessionSlice';
import FlashCard from "./FlashCard";
import MultipleChoiceCard from "./MultipleChoiceCard";
import TrueFalseCard from "./TrueFalseCard";
import { store } from '../store';
import { useRef } from 'react';
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

const CardWrapper = styled.div`
    border: 1px solid black; 
    width: 28em;
    height: 32em;
    min-height: 20em;
`

const PracticeSessionWrapper = styled.div`
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    width: 100%; 
    height: 100%;
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
`

const StatsWrapper = styled.div`
    margin: 5rem; 
    max-width: 45rem;
`

function PracticeSession() {
    let { deckId, userId } = useParams();
    const activeCard = useSelector((state) => state.practiceSession.activeCard);
    const stats = useSelector((state) => state.practiceSession.stats);
    const numCards = useSelector((state) => state.practiceSession.numCards);
    let retryStatus = useSelector((state) => state.practiceSession.retryStatus);
    let dispatch = useDispatch();
    let navigate = useNavigate();

    let firstRender = useRef(true);
    useEffect(() => {
        if(!activeCard?.cardType && firstRender.current) {
            firstRender.current = false;
            //eventually need to add something to this, either userId or token to make sure user has authorization to access the deck
            dispatch(fetchDeck(deckId));
        }
    }, [activeCard, deckId, dispatch])

    useEffect(() => {
        return () => {
            console.log("reset")
            dispatch(resetSession());
        }
    }, [dispatch]);

    const handlePracticeDeckAgain = () => {
            const cardAttempts = store.getState().practiceSession.cardAttempts;
            dispatch(practiceDeckAgain({deckId, userId, retryStatus, cardAttempts, accuracyRate: (stats.numberCorrect / (stats.numberCorrect + stats.numberWrong)) * 100}));
    }
    
    const handleRetryMissedCards = () => {
        const cardAttempts = store.getState().practiceSession.cardAttempts;
        dispatch(retryMissedCards({deckId, userId, retryStatus, cardAttempts, accuracyRate: (stats.numberCorrect / (stats.numberCorrect + stats.numberWrong)) * 100}));
    }

    const navigateAway = (evt) => {
        const cardAttempts = store.getState().practiceSession.cardAttempts;
        dispatch(endPractice({deckId, userId, retryStatus, cardAttempts, accuracyRate: (stats.numberCorrect / (stats.numberCorrect + stats.numberWrong)) * 100}))
            .then(() => {
                if(evt.target.value === "dashboard") {
                    navigate("/dashboard");
                } else {
                    navigate(`/users/${userId}/practice`);
                }
            });
    }

    return (
        <PracticeSessionWrapper>
            <StatsWrapper className="container">
                <StatsRow className="row">
                    <StatsColumn className="col">
                        <h3>Correct</h3>
                        <p>{stats.numberCorrect || 0}</p>
                    </StatsColumn>
                    <StatsColumn className="col">
                        <h3>Incorrect</h3>
                        <p>{stats.numberWrong || 0}</p>
                    </StatsColumn>
                    <StatsColumn className="col">
                        <h3>Accuracy Rate</h3>
                        <p>{stats.numberCorrect || stats.numberWrong ? stats.numberCorrect * 100 / (stats.numberCorrect + stats.numberWrong) + "%" : "%"}</p>
                    </StatsColumn>
                    <StatsColumn className="col">
                        <h3>Cards Left</h3>
                        <p>{numCards - (stats.numberCorrect + stats.numberWrong)}</p>
                    </StatsColumn>
                </StatsRow>
            </StatsWrapper>
            <CardWrapper>
                {activeCard?.cardType ? 
                    createCard(activeCard.cardType) 
                    : 
                    <div>
                        {stats.numberWrong ? 
                            <button onClick={handleRetryMissedCards}>Retry Missed Cards</button>
                            :
                            null
                        }
                        <button onClick={handlePracticeDeckAgain}>Practice Deck Again</button>
                        <button value="practice" onClick={navigateAway}>Select Another Deck</button>
                        <button value="dashboard" onClick={navigateAway}>Home</button>
                    </div>
                }
            </CardWrapper>
        </PracticeSessionWrapper>
    )
}

export default PracticeSession