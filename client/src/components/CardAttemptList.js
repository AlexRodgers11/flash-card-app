import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { fetchCardAttemptIds } from "../reducers/attemptsSlice";
import CardAttempt from "./CardAttempt";
import styled from "styled-components";

const CardAttemptListWrapper = styled.div`
    padding-top: 4rem;

    @media (max-width: 515px) {
        padding-top: 6rem;
    }
`;

function CardAttemptList() {
    const attemptIds = useSelector((state) => state.attempts.cardAttemptIds);
    const selectedCardId = useSelector((state) => state.attempts.selectedCardId);
    const { cardId } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        if(cardId !== selectedCardId) {
            console.log("should be fetching attemptIds");
            dispatch(fetchCardAttemptIds({cardId}));
        }
    }, [cardId, selectedCardId, dispatch]);

    return (
        <CardAttemptListWrapper>
            {attemptIds.map(cardAttemptId => <CardAttempt individualCard={true} cardAttemptId={cardAttemptId} />)}
        </CardAttemptListWrapper>
    );
}

export default CardAttemptList;