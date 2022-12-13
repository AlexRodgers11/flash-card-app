import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

const baseURL = 'http://localhost:8000';

function DeckStatsTile(props) {
    const [deckData, setDeckData]  = useState({});
    const { userId } = useParams();

    useEffect(() => {
        if(!deckData.name) {
            axios.get(`${baseURL}/decks/${props.deckId}/tile-stats`)
                .then((response) => setDeckData(response.data))
                .catch((err) => console.error(err.message));
        }
    }, [deckData.name, props.deckId]);
    
    return (
        <Link to={`/users/${userId}/statistics/sessions/decks/${props.deckId}`}>
            <div style={{border: "1px solid black", display: "inline-block", margin: "1em", padding: "1em"}}>
                <h1><strong>{deckData.deckName}</strong></h1>
                <p>Accuracy Rate: {deckData.accuracyRate}%</p>
                <p>Last practiced <strong>{deckData.dateLastPracticed}</strong></p>
                <p>Times practiced:{deckData.timesPracticed}</p>
                <p>Card count: {deckData.cardCount}</p>
            </div>
        </Link>
    );
}

export default DeckStatsTile;