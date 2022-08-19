import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDeck } from '../reducers/deckSlice';
import { useParams } from 'react-router';

function Deck() {
    // const { deckId, name, publiclyAvailable, creator, cards, permissions } = useSelector((state) => state.deck);
    const storedDeckId = useSelector((state) => state.deck.deckId);
    const name = useSelector((state) => state.deck.name);
    const publiclyAvailable = useSelector((state) => state.deck.publiclyAvailable);
    const creator = useSelector((state) => state.deck.creator);
    const cards = useSelector((state) => state.deck.cards);
    const permissions = useSelector((state) => state.deck.permissions);
    
    const { deckId } = useParams();

    const dispatch = useDispatch();

    useEffect(() => {
        console.log("use effect ran");
        if(!storedDeckId || storedDeckId !== deckId) {
            dispatch(fetchDeck(deckId));
        }
    }, [deckId, dispatch, storedDeckId]);
    
    return (
        <div>
            <h1>{name}</h1>
            <h3>{creator}</h3>
            <p>Public?: {publiclyAvailable ? "True" : "False"}</p>
            {cards.map(card => <p>{card}</p>)}
        </div>
    )
}

export default Deck
