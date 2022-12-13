import React, { useEffect } from "react";
import { useParams } from "react-router";
import CardAttempt from "./CardAttempt";
import { useDispatch, useSelector } from "react-redux";
import { fetchAttemptData } from "../reducers/attemptsSlice";

function Attempt() {
    const attempt = useSelector((state) => state.attempts.attempt);
    const { sessionId } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        if(attempt._id !== sessionId) {
            dispatch(fetchAttemptData({attemptId: sessionId}))
        }
    }, [attempt._id, dispatch, sessionId]);

    return (
        <div>
            <h1>Deck: {attempt.deck?.name}</h1>
            <div>{attempt.cards?.map(card => <CardAttempt cardAttemptId={card} />)}</div>
        </div>
    );
}

export default Attempt;