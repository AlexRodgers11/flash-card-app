import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import axios from "axios";

const baseURL = 'http://localhost:8000';

function DeckTile(props) {
    const [deckData, setDeckData] = useState({});
    const location = useLocation();
    const navigate = useNavigate();

    const handleSelection = () => {
        let letter = location.pathname.slice(32, 33)
        if(letter === "d") {
            navigate(`/decks/${props.deckId}`)
        } else if(letter === "p") {
            navigate(`/users/${deckData.creatorId}/decks/${props.deckId}/practice-session`);
        }
    }
    

    const handleKeyPress = (evt) => {
        if(evt.keyCode === 13) {
            handleSelection();
        }
    }

    useEffect(() => {
        axios.get(`${baseURL}/decks/${props.deckId}/tile`)
            .then((response) => setDeckData(response.data))
            .catch((err) => console.log(err));
    }, [props.deckId]);
  
    return (
    <div tabIndex={0} onKeyDown={handleKeyPress} onClick={handleSelection} style={{border: "1px solid black", display: "inline-block", margin: "1em", padding: "1em"}}>
        <h4>{deckData.name}</h4>
        <p>{deckData.Name}</p>
        <p>{deckData.createdAt}</p>
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
