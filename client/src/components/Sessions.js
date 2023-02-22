import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { fetchDeckAttemptIds, fetchUserAttemptIds } from "../reducers/attemptsSlice";
import { resetPracticedSinceAttemptsPulled } from "../reducers/practiceSessionSlice";
import AttemptTile from "./AttemptTile";
import styled from "styled-components";

const SessionsWrapper = styled.div`
    padding-top: 4.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: calc(100vh - 8.5rem);

    @media (max-width: 515px) {
        padding-top: 6.5rem;
    }
`;

function Sessions(props) {
    const attemptIdsOfUser = useSelector((state) => state.attempts.attemptIdsOfUser);
    const attemptIdsOfDeck = useSelector((state) => state.attempts.attemptIdsOfDeck);
    const selectedDeckId = useSelector((state) => state.attempts.selectedDeckId);
    const userId = useSelector((state) => state.login.userId);
    const practicedSinceAttemptsPulled = useSelector((state) => state.practiceSession.practicedSinceAttemptsPulled);
    const { deckId } = useParams();
    const dispatch = useDispatch();
    
    const userAttemptsRetrieved = useRef(false);

    useEffect(() => {
        if(props.allDecks) {
            if((!attemptIdsOfUser.length && !userAttemptsRetrieved.current) || practicedSinceAttemptsPulled) {
                console.log("dispatching");
                dispatch(fetchUserAttemptIds({userId}));
                dispatch(resetPracticedSinceAttemptsPulled());
                userAttemptsRetrieved.current = true;
            }
        } else if(deckId !== selectedDeckId || practicedSinceAttemptsPulled) {
            dispatch(fetchDeckAttemptIds({deckId}));
            dispatch(resetPracticedSinceAttemptsPulled());
        }
    }, [attemptIdsOfUser, deckId, dispatch, practicedSinceAttemptsPulled, props.allDecks, selectedDeckId, userId]);

    return (
        <SessionsWrapper>
            {props.allDecks && attemptIdsOfUser?.map(id => <AttemptTile attemptId={id} />)}
            {!props.allDecks && attemptIdsOfDeck?.map(id => <AttemptTile attemptId={id} />)}
        </SessionsWrapper>
    );
}

export default Sessions;