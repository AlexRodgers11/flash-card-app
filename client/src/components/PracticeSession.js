import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router';
import { endPractice, fetchDeck, practiceDeckAgain, retryMissedCards, saveAttempts } from '../reducers/practiceSessionSlice';
import FlashCard from "./FlashCard";
import MultipleChoiceCard from "./MultipleChoiceCard";
import TrueFalseCard from "./TrueFalseCard";
import axios from "axios";
import { store } from '../store';
import { useRef } from 'react';

const baseURL = 'http://localhost:8000';

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

function PracticeSession() {
    let { deckId, userId } = useParams();
    const activeCard = useSelector((state) => state.practiceSession.activeCard);
    const stats = useSelector((state) => state.practiceSession.stats);
    let retryStatus = useSelector((state) => state.practiceSession.retryStatus);
    // let [retryStatus, toggleRetryStatus] = useToggle();
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

    // const handleAnswerCard = (answeredCorrectly, cardId) => {
    // const handleAnswerCard = (answeredCorrectly) => {
    //     console.log(`dispatching handle answer card with isCorrect value of ${answeredCorrectly}`);
    //     dispatch(addCardAttempt({answeredCorrectly, cardIndex: attempts.length}));
    // }

    const handlePracticeDeckAgain = () => {
            const cardAttempts = store.getState().practiceSession.cardAttempts;
            dispatch(practiceDeckAgain({deckId, userId, retryStatus, cardAttempts}));
    }

    // const handleRetryMissedCards = () => {
    //     if(!retryStatus) {
    //         console.log("adding session attempt to database");
    //         axios.post(`${baseURL}/users/${userId}/attempts`, {
    //             user: userId,
    //             deck: deckId,
    //             datePracticed: new Date().toString(),
    //             cards: [...attempts]
    //         })
    //         .then(() => {
    //             console.log("dispatching retryMissedCards after saving attempts");
    //             dispatch(retryMissedCards());
    //         })
    //         .catch(err => console.error(err));  
    //     } else {
    //         console.log("dispatching retryMissedCards without saving practice attempts");
    //         dispatch(retryMissedCards())
    //     }
        
    // }
    
    const handleRetryMissedCards = () => {
        const cardAttempts = store.getState().practiceSession.cardAttempts;
        dispatch(retryMissedCards({deckId, userId, retryStatus, cardAttempts}));
    }

    // const handleGoToUserPage = async () => {
    //     if(!retryStatus) {
    //         try {
    //             await axios.post(`${baseURL}/users/${userId}/attempts`, {
    //                 user: userId,
    //                 deck: deckId,
    //                 datePracticed: new Date().toString(),
    //                 cards: [...attempts]
    //             });
    //         } catch (err) {
    //             console.error(err)
    //         }
    //     } 
    //     dispatch(endPractice);
    //     navigate(`/dashboard`);
    // }

    const handleGoToUserPage = () => {
        const cardAttempts = store.getState().practiceSession.cardAttempts;
        dispatch(endPractice({deckId, userId, retryStatus, cardAttempts}))
            .then(() => {
                navigate("/dashboard");
            });
    }

    return (
        <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div style={{border: "1px solid black", marginTop:"5em", width: "30em", height:"40em"}}>
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
                        <button onClick={handleGoToUserPage}>Back to Decks</button>
                    </div>
                }
            </div>
        </div>
    )

    // return (
    //     <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
    //         <div style={{border: "1px solid black", marginTop:"5em", width: "30em", height:"40em"}}>
    //             {practiceSet[attempts.length]?.cardType ? 
    //                 createCard(practiceSet[attempts.length].cardType, attempts.length, handleAnswerCard) 
    //                 : 
    //                 <div>
    //                     {attempts.filter(attempt => !attempt.answeredCorrectly).length ? 
    //                         <button onClick={handleRetryMissedCards}>Retry Missed Cards</button>
    //                         :
    //                         null
    //                     }
    //                     <button onClick={handlePracticeDeckAgain}>Practice Deck Again</button>
    //                     <button onClick={handleGoToUserPage}>Back to Decks</button>
    //                 </div>}
    //         </div>
    //     </div>
    // )
}

export default PracticeSession