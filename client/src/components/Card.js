import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';

const baseURL = 'http://localhost:8000';

function Card(props) {
    const [cardData, setCardData] = useState({});

    useEffect(() => {
        console.log("Card use effect running");
        axios.get(`${baseURL}/cards/${props.cardId}`)
            .then((response) => setCardData(response.data))
            .catch((err) => console.log(err));
    // }, [props.cardId]);
    }, [props]);

    return (
        <>
            {!props.displayMode ?
                <>{cardData.question}</>
                :
                <>
                <h3>Question: {cardData.question}</h3>
                <p>Hint: {cardData.hint || 'No hint given'}</p>
                <p>Correct Answer: {cardData.correctAnswer}</p>
                {cardData.cardType !== 'multiple-choice' ?
                    null
                    :
                    <>
                    <p>Wrong Answer One: {cardData.wrongAnswerOne}</p>
                    <p>Wrong Answer Two: {cardData.wrongAnswerTwo}</p>
                    <p>Wrong Answer Three: {cardData.wrongAnswerThree}</p>
                    </>
                }
                </>
            }
        </>
    )
}

Card.propTypes = { 
    cardId: PropTypes.string,
    displayMode: PropTypes.bool
}

export default Card
