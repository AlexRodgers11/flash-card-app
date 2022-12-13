import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { fetchStatsCardIds } from "../reducers/attemptsSlice";
import CardStatsTile from "./CardStatsTile";

function CardStatsList() {
    const cardIds = useSelector((state) => state.attempts.cardIds);
    const { userId } = useParams();
    const dispatch = useDispatch();

    const cardsRetrieved = useRef(false)
    useEffect(() => {
        if(!cardIds.length && !cardsRetrieved.current) {
            console.log("condition met")
            dispatch(fetchStatsCardIds({userId}));
            cardsRetrieved.current = true;
        }
    }, [cardIds, dispatch, userId]);

    return (
        <div>
            {cardIds.map(card => (
                <div>
                    <h1>Deck: {card.name}</h1>
                    {card.cards.map(cardId => <CardStatsTile cardId={cardId} />)}
                </div>
            ))}
        </div>
    );
}

export default CardStatsList;