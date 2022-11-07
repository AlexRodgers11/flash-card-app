import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router';
// import useToggle from '../hooks/useToggle';
import { addCardAttempt, endPractice, fetchDeck, practiceDeckAgain, retryMissedCards } from '../reducers/practiceSessionSlice';
import FlashCard from "./FlashCard";
import MultipleChoiceCard from "./MultipleChoiceCard";
import TrueFalseCard from "./TrueFalseCard";
import axios from "axios";

const baseURL = 'http://localhost:8000';

const createCard = (type, idx, func) => {
    switch(type) {
        case 'FlashCard': 
            return <FlashCard answerCard={func} cardIndex={idx}/>
        case 'TrueFalseCard':
            return <TrueFalseCard answerCard={func} cardIndex={idx}/>
        case 'MultipleChoiceCard':
            return <MultipleChoiceCard answerCard={func} cardIndex={idx}/>
        default:
            console.error("createCard function passed an invalid argument");
    }
}

function PracticeSession() {
    let { deckId, userId } = useParams();
    // let userId = useSelector((state) => state.practiceSession.userId);
    // let deckId = useSelector((state) => state.practiceSession.deckId);
    let practiceSet = useSelector((state) => state.practiceSession.practiceSet);
    let attempts = useSelector((state) => state.practiceSession.attempts);
    let retryStatus = useSelector((state) => state.practiceSession.retryStatus);
    // let [retryStatus, toggleRetryStatus] = useToggle();
    let dispatch = useDispatch();
    let navigate = useNavigate();

    useEffect(() => {
        // console.log("useEffect for fetching ran");
        if(!practiceSet.length) {
            dispatch(fetchDeck(deckId));
        }
    }, [practiceSet, deckId, dispatch, userId])

    // const handleAnswerCard = (answeredCorrectly, cardId) => {
    const handleAnswerCard = (answeredCorrectly) => {
        console.log(`dispatching handle answer card with isCorrect value of ${answeredCorrectly}`);
        dispatch(addCardAttempt({answeredCorrectly, cardIndex: attempts.length}));
    }

    const handlePracticeDeckAgain = () => {
        if(!retryStatus) {
            axios.post(`${baseURL}/users/${userId}/attempts`, {
                user: userId,
                deck: deckId,
                datePracticed: new Date().toString(),
                cards: [...attempts]
            })
            .then(() => {
                dispatch(practiceDeckAgain());
            })
            .catch(err => console.error(err));
        } else {
            dispatch(practiceDeckAgain());
        }
        
    }

    const handleRetryMissedCards = () => {
        if(!retryStatus) {
            console.log("adding session attempt to database");
            axios.post(`${baseURL}/users/${userId}/attempts`, {
                user: userId,
                deck: deckId,
                datePracticed: new Date().toString(),
                cards: [...attempts]
            })
            .then(() => {
                console.log("dispatching retryMissedCards after saving attempts");
                dispatch(retryMissedCards());
            })
            .catch(err => console.error(err));  
        } else {
            console.log("dispatching retryMissedCards without saving practice attempts");
            dispatch(retryMissedCards())
        }
        
    }

    const handleGoToUserPage = async () => {
        if(!retryStatus) {
            try {
                await axios.post(`${baseURL}/users/${userId}/attempts`, {
                    user: userId,
                    deck: deckId,
                    datePracticed: new Date().toString(),
                    cards: [...attempts]
                });
            } catch (err) {
                console.error(err)
            }
        } 
        dispatch(endPractice);
        navigate(`/dashboard`);
    }

    return (
        <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{border: "1px solid black", marginTop:"5em", width: "30em", height:"40em"}}>
                {practiceSet[attempts.length]?.cardType ? 
                    createCard(practiceSet[attempts.length].cardType, attempts.length, handleAnswerCard) 
                    : 
                    <div>
                        {attempts.filter(attempt => !attempt.answeredCorrectly).length ? 
                            <button onClick={handleRetryMissedCards}>Retry Missed Cards</button>
                            :
                            null
                        }
                        <button onClick={handlePracticeDeckAgain}>Practice Deck Again</button>
                        <button onClick={handleGoToUserPage}>Back to Decks</button>
                    </div>}
            </div>
        </div>
    )
}

export default PracticeSession