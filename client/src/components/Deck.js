import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDeck } from '../reducers/deckSlice';
import { useNavigate, useParams } from 'react-router';
import Card from './Card';
import useToggle from '../hooks/useToggle';
import axios from 'axios';
import { deleteDeck } from '../reducers/decksSlice';

const baseURL = 'http://localhost:8000';

function Deck() {
    // const { deckId, name, publiclyAvailable, creator, cards, permissions } = useSelector((state) => state.deck);
    const storedDeckId = useSelector((state) => state.deck.deckId);
    const name = useSelector((state) => state.deck.name);
    const publiclyAvailable = useSelector((state) => state.deck.publiclyAvailable);
    const creator = useSelector((state) => state.deck.creator);
    const cards = useSelector((state) => state.deck.cards);
    const permissions = useSelector((state) => state.deck.permissions);
    const [editMode, toggleEditMode] = useToggle(false);
    const [deleteInitiated, toggleDeleteInitiated] = useToggle(false);
    
    const { deckId } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const initiateDeleteDeck = () => {
        toggleDeleteInitiated();
    }

    const cancelDeleteDeck = () => {
        toggleDeleteInitiated();
    };

    const confirmDeleteDeck = () => {
        axios.delete(`${baseURL}/decks/${deckId}`)
            .then(() => {
                dispatch(deleteDeck({deckId}));
                navigate("/dashboard");
            })
            .catch(err => {
                console.error(err);
            })
    };

    useEffect(() => {
        console.log("use effect ran");
        if(!storedDeckId || storedDeckId !== deckId) {
            dispatch(fetchDeck(deckId));
        }
    }, [deckId, dispatch, storedDeckId]);
    
    return (
        <div>
            <button onClick={toggleEditMode}>{editMode ? "Done" : "Edit"}</button>
            <button onClick={initiateDeleteDeck}>Delete</button>
            {!deleteInitiated ?
                null
                :
                <div>
                    <button onClick={confirmDeleteDeck}>Yes</button>
                    <button onClick={cancelDeleteDeck}>No</button>
                </div>
            }
            <h1>{name}</h1>
            <h3>{creator}</h3>
            <p>Public?: {publiclyAvailable ? "True" : "False"}</p>
            {cards.map(card => <p><Card cardId={card} /></p>)}
        </div>
    )
}

export default Deck
