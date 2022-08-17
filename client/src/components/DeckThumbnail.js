import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useEffect } from 'react';
import axios from "axios";

function DeckThumbnail(props) {
    const [deckData, setDeckData] = useState({});

    useEffect(() => {
        const baseURL = 'http://localhost:8000';
        axios.get(`${baseURL}/decks/${props.deckId}?thumbnail=true`)
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
    </div>
  )
}

DeckThumbnail.propTypes = {
    deckId: PropTypes.string
}

export default DeckThumbnail
