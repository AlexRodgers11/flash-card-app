import React, { useEffect } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchDeckAttemptData } from "../reducers/attemptsSlice";
import styled from "styled-components";
import DeckAttemptCardsTable from "./DeckAttemptCardsTable";

const DeckAttemptWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    padding-top: 4rem;
    @media (max-width: 515px) {
        padding-top: 6rem;
    }
`;

const DeckTitle = styled.div`
    background-color: white;
    padding: 1rem;
    border: 2px solid black;
    border-radius: 1rem;
`;

function DeckAttempt() {
    const deckAttempt = useSelector((state) => state.attempts.deckAttempt);
    const { sessionId } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("in DeckAttempt useEffect");
        if(deckAttempt._id !== sessionId) {
            dispatch(fetchDeckAttemptData({attemptId: sessionId}))
        }
    }, [deckAttempt._id, dispatch, sessionId]);

    if(deckAttempt._id === sessionId) {
        return (
            <DeckAttemptWrapper className="DeckAttemptWrapper">
                <DeckTitle>
                    <h1><strong>Deck:</strong> {deckAttempt.deck?.name}</h1>
                </DeckTitle>
                <DeckAttemptCardsTable />
            </DeckAttemptWrapper>
        );
    } else {
        return (<div></div>);
    }
}

export default DeckAttempt;