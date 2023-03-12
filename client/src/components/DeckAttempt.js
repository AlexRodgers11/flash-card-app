import React, { useEffect } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchDeckAttemptData } from "../reducers/attemptsSlice";
import styled from "styled-components";
import DeckAttemptCardsTable from "./DeckAttemptCardsTable";

const DeckAttemptWrapper = styled.div`
    position: relative;
    top: 4rem;

    @media (max-width: 515px) {
        top: 6rem;
    }
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
            <DeckAttemptWrapper>
                <h1>Deck: {deckAttempt.deck?.name}</h1>
                <DeckAttemptCardsTable />
            </DeckAttemptWrapper>
        );
    } else {
        return (<div></div>);
    }
}

export default DeckAttempt;