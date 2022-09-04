import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';

function Card(props) {
    const [cardData, setCardData] = useState({});

    useEffect(() => {
        console.log("Card use effect running");
        const baseURL = 'http://localhost:8000';
        axios.get(`${baseURL}/cards/${props.cardId}`)
            .then((response) => setCardData(response.data))
            .catch((err) => console.log(err));
    // }, [props.cardId]);
    }, [props]);

    return (
        <div>{cardData.question}</div>
    )
}

Card.propTypes = { 
    cardId: PropTypes.string
}

export default Card
