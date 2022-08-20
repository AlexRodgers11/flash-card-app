import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import axios from "axios";


function DeckTile(props) {
    const baseURL = 'http://localhost:8000';
    const [deckData, setDeckData] = useState({});
    const navigate = useNavigate();
    const handleViewDeck = (evt) => {
        navigate(`/decks/${evt.target.value}`)
    }

    useEffect(() => {
        axios.get(`${baseURL}/decks/${props.deckId}?tile=true`)
            .then((response) => setDeckData(response.data))
            .catch((err) => console.log(err));
    }, [props.deckId]);
  
    return (
    <div>
        <h1>{deckData.name}</h1>
        <p>{deckData.creator}</p>
        <p>{deckData.dateCreated}</p>
        <p>{deckData.public}</p>
        <p>{deckData.cardCount}</p>
        <button type="button" value={props.deckId} onClick={handleViewDeck}>View</button>
    </div>
  )
}

DeckTile.propTypes = {
    deckId: PropTypes.string
}

export default DeckTile
