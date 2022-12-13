import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

const baseURL = 'http://localhost:8000';

function CardStatsTile(props) {
    const [cardData, setCardData]  = useState({});
    const { userId } = useParams();

    useEffect(() => {
        if(!cardData.name) {
            axios.get(`${baseURL}/cards/${props.cardId}/tile-stats`)
                .then((response) => setCardData(response.data))
                .catch((err) => console.error(err.message));
        }
    }, [cardData.name, props.cardId]);
    
    return (
        <Link to={`/users/${userId}/statistics/cards/${props.cardId}`}>
            <div style={{border: "1px solid black", display: "inline-block", margin: "1em", padding: "1em"}}>
                <h3><strong>{cardData.cardQuestion}</strong></h3>
                <p>Accuracy Rate: {cardData.accuracyRate}%</p>
                <p>Last practiced <strong>{cardData.dateLastPracticed}</strong></p>
                <p># Times Practiced: {cardData.attemptCount}</p>
            </div>
        </Link>
    );
}

export default CardStatsTile;