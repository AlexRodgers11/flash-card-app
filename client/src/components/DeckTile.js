import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import axios from "axios";
import { RxEyeOpen, RxEyeClosed } from "react-icons/rx";

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
        <div tabIndex={0} onKeyDown={handleKeyPress} onClick={handleSelection} style={{display: "inline-flex", flexDirection: "column", justifyContent: "space-between", border: "2px solid black", borderRadius: "1rem", height: "17rem", width: "13rem", margin: "1em"}}>
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".75rem", paddingBottom: "0rem"}}>
                <p style={{display: "inline-block", justifySelf: "start", margin: "0rem"}}>{deckData.publiclyAvailable ? <RxEyeOpen size="1.25rem"/> : <RxEyeClosed size="1.25rem" />}</p>
                <p style={{position: "relative", left:".5rem", display: "inline-flex", alignItems: "center", justifySelf: "end", fontSize:"1.25rem", margin: "0rem"}}>
                    <span style={{paddingRight: ".1rem"}}>{deckData.cardCount}</span>
                    <span style={{position: "relative", bottom: ".15rem", display: "inline-block", height: "1rem", width: ".8rem", border:"1px solid black", borderRadius: ".1rem", opacity: 1, zIndex: 2}} />
                    <span style={{position: "relative", top: ".15rem", right: ".5rem", display: "inline-block", height: "1rem", width: ".8rem", border:"1px solid black", borderRadius: ".1rem"}} />
                </p>
            </div>
            <div style={{display: "flex", flexDirection: "column", justifyContent: "center"}}>
                {deckData.url && <img src={deckData.url} alt="Deku" style={{height: "7rem", width: "100%"}} />}

                {deckData.url && <h5>{deckData.name}</h5>}
                {!deckData.url && <h1 style={{padding: "0 .25rem", margin: "0"}}>{deckData.name}</h1>}
            </div>
            {/* <p style={{margin: "0", paddingBottom: ".75rem"}}>{deckData.createdAt}</p> */}
            <p style={{margin: "0", paddingBottom: ".75rem", height: "2.6rem"}}></p>
        </div>
    )
}

DeckTile.propTypes = {
    deckId: PropTypes.string
}

export default DeckTile
