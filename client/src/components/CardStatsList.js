import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { fetchCardStatsByDeck } from "../reducers/attemptsSlice";
import CardStatsTile from "./CardStatsTile";
import styled from "styled-components";

const CardStatsListWrapper = styled.div`
    position: relative;
    top: 4rem;

    @media (max-width: 515px) {
        top: 6rem;
    }
`;

function CardStatsList() {
    const cardStatsByDeck = useSelector((state) => state.attempts.cardStatsByDeck);
    const { userId } = useParams();
    const dispatch = useDispatch();

    const cardsRetrieved = useRef(false)
    useEffect(() => {
        if(!cardStatsByDeck.length && !cardsRetrieved.current) {
            console.log("condition met")
            dispatch(fetchCardStatsByDeck({userId}));
            cardsRetrieved.current = true;
        }
    }, [cardStatsByDeck, dispatch, userId]);

    return (
        <CardStatsListWrapper>
            {cardStatsByDeck.map(deck => (
                <div>
                    <h1>Deck: {deck.name}</h1>
                    {deck.cards.map(cardId => <CardStatsTile key={cardId} cardId={cardId} />)}
                </div>
            ))}
        </CardStatsListWrapper>
    );
}

export default CardStatsList;