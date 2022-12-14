import React, { useEffect } from "react";
import { useParams } from "react-router";
import CardAttempt from "./CardAttempt";
import { useDispatch, useSelector } from "react-redux";
import { fetchDeckAttemptData } from "../reducers/attemptsSlice";

function DeckAttempt() {
    const deckAttempt = useSelector((state) => state.attempts.deckAttempt);
    const { sessionId } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        if(deckAttempt._id !== sessionId) {
            dispatch(fetchDeckAttemptData({attemptId: sessionId}))
        }
    }, [deckAttempt._id, dispatch, sessionId]);

    return (
        <div>
            <h1>Deck: {deckAttempt.deck?.name}</h1>
            <div>{deckAttempt.cards?.map(card => <CardAttempt cardAttemptId={card} />)}</div>
        </div>
    );
}

export default DeckAttempt;