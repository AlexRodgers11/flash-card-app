import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import axios from "axios";


function DeckTile(props) {
    const baseURL = 'http://localhost:8000';
    const [deckData, setDeckData] = useState({});
    const navigate = useNavigate();
    const handleViewDeck = () => {
        navigate(`/decks/${props.deckId}`)
    }

    useEffect(() => {
        axios.get(`${baseURL}/decks/${props.deckId}?tile=true`)
            .then((response) => setDeckData(response.data))
            .catch((err) => console.log(err));
    }, [props.deckId]);
  
    return (
    <div onClick={handleViewDeck} style={{border: "1px solid black", display: "inline-block", margin: "1em", padding: "1em"}}>
        <h4>{deckData.name}</h4>
        <p>{deckData.creator}</p>
        <p>{deckData.dateCreated}</p>
        <p>{deckData.public}</p>
        <p>{deckData.cardCount}</p>
        {/* <button type="button" value={props.deckId} onClick={handleViewDeck}>View</button> */}
    </div>
  )
}

DeckTile.propTypes = {
    deckId: PropTypes.string
}

export default DeckTile
