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

const PracticeSessionWrapper = styled.div`
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    // justify-content: center; 
    width: 100%; 
    height: 100%;
    // icy blue
    // background-color: #9EFFFF;
    // background-color: #FDF581;
    // pale yellow
    background-color: #FFFD8A;
    // neutrals
    // background-color: #5A5B6C;
    // background-color: #515276;
    // background-color: #4F5178;
    // darker neutrals
    // background-color: #3E3F5B;
    // background-color: #252637;
    // background-color: #4C4C52;

    min-height: calc(100vh - 5.5rem);
`

const CardWrapper = styled.div`
    border: 1px solid black; 
    overflow: hidden;
    border-radius: 3rem;
    background-color: white;
    width: 28em;
    height: 32em;
    min-height: 20em;
    // margin-bottom: 10rem;
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
    color: white;
    & .col {
        // margin: 0 .15rem;
        margin: 0 .5rem;
        background-color: white;
        &.correct {
            background-color: #0D6EFD
        }
        &.incorrect {
            background-color: #DC3545
        }
        &.accuracy-rate {
            color: black;
            // background-color: #198754;
        }
        &.cards-left {
            color: black;
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
            {/* <div className="centered-display"> */}
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
                        <p>{stats.numberCorrect || stats.numberWrong ? stats.numberCorrect * 100 / (stats.numberCorrect + stats.numberWrong) + "%" : "%"}</p>
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
                        <button className="btn btn-lg btn-success" onClick={handlePracticeDeckAgain}>Practice Deck Again</button>
                        {stats.numberWrong ? 
                            <button className="btn btn-lg btn-danger" onClick={handleRetryMissedCards}>Retry Missed Cards</button>
                            :
                            null
                        }
                        <button className="btn btn-lg btn-primary" value="practice" onClick={navigateAway}>Select Another Deck</button>
                        <button className="btn btn-lg btn-dark" value="dashboard" onClick={navigateAway}>Home</button>
                    </WrapUpButtonsContainer>
                }
            </CardWrapper>
            {/* </div> */}
        </PracticeSessionWrapper>
    )
}

export default PracticeSession