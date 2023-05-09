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
    justify-content: center; 
    width: 100%; 
    // height: 100%;
    height: calc(100vh - 5.5rem);
    background-color: #9DE59D;
    // min-height: calc(100vh - 5.5rem);
    // @media (min-width: 450px) {
    //     min-height: 710px;
    // }
    // @media (min-width: 600px) {
    //     min-height: 870px;
    // }
    // @media (max-width: 600px) {
    // }
`

const CardWrapper = styled.div`
    border: 3px solid black; 
    overflow: hidden;
    border-radius: 10%;
    background-color: #2C262C;
    width: 28rem;
    min-height: 32rem;
    // min-height: 20em;
    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
    @media (max-width: 600px) {
        width: 25rem;
        min-height: 28.5rem;
    }

    @media (max-width: 550px) {
        width: 21rem;
        min-height: 24rem;
    }

`
const StatsWrapper = styled.div`
    position: absolute;
    @media (max-height: 870px) and (min-width: 601px) {
        position: static;
    }
    @media (max-height: 762px) and (min-width: 551px) {
        position static;
    }
    top: 6rem;
    margin: 1rem 0;
`;

const StatContainer = styled.div`
    display: inline-flex;
    flex-direction: column;
    align-items: center; 
    justify-content: center;
    padding: 1rem;
    margin: 0 1rem;
    background-color: white;
    border: 2px solid black;
    @media (max-width: 750px) {
        margin: 0 .75rem;
        padding: .75rem;
    }
    @media (max-width: 600px) {
        margin: 0 .5rem;
        padding: .5rem;
    }
    @media (max-width: 550px) {
        padding: .25rem;
    }
    @media (max-width: 460px) {
        margin: 0 .25rem;
        padding: .125rem;
    }
`;

const StatHeading = styled.p`
    font-weight: 700;
    font-size: 1.5rem;
    padding-bottom: .5rem;
    @media (max-width: 700px) {
        font-weight: 600;
        font-size: 1.25rem;    
    }
    @media (max-width: 500px) {
        padding-bottom: .125rem;
        font-weight: 500;
        font-size: 1.125rem;
    }
    @media (max-width: 400px) {
        font-size: 1rem;
    }
    @media (max-width: 374px) {
        font-size: .825rem;
    }
`;

const Stat = styled.p`
    font-weight: 500;
    @media (max-width: 500px) {
        font-size: .825rem;
    }
    @media (max-width: 374px) {
        font-size: .75rem;
    }
    
`;

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
            <StatsWrapper>
                <StatContainer>
                    <StatHeading>Correct</StatHeading>
                    <Stat>{stats.numberCorrect || 0}</Stat>
                </StatContainer>
                <StatContainer>
                    <StatHeading>Incorrect</StatHeading>
                    <Stat>{stats.numberWrong || 0}</Stat>   
                </StatContainer>
                <StatContainer>
                    <StatHeading>Accuracy Rate</StatHeading>
                    <Stat>{stats.numberCorrect || stats.numberWrong ? (stats.numberCorrect * 100 / (stats.numberCorrect + stats.numberWrong)).toFixed() + "%" : "0%"}</Stat>
                </StatContainer>
                <StatContainer>
                    <StatHeading>Cards Left</StatHeading>
                    <Stat>{numCards - (stats.numberCorrect + stats.numberWrong)}</Stat>    
                </StatContainer>
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