import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { fetchCardStatsByDeck } from "../reducers/attemptsSlice";
import CardStatsTile from "./CardStatsTile";
import styled from "styled-components";

const CardStatsListWrapper = styled.div`
    padding-top: 4.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    @media (max-width: 515px) {
        padding-top: 6.5rem;
    }
`;

const DeckBox = styled.div`
    width: 100%;
    margin-bottom: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const DeckHeader = styled.h1`
    width: 90%;
    background-color: blue;
    margin-bottom: .5rem;
    @media (max-width: 450px) {
        width: 100%;
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
            {cardStatsByDeck.map(deck => {
                if(deck.cards.length) {
                    return (
                        <DeckBox>
                            <DeckHeader>Deck: {deck.name}</DeckHeader>
                            {deck.cards.map(cardId => <CardStatsTile key={cardId} cardId={cardId} />)}
                        </DeckBox>
                    );
                } else {
                    return <></>
                }
            })}
        </CardStatsListWrapper>
    );
}

export default CardStatsList;