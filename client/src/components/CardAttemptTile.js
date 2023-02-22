import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import axios from "axios";

const baseURL = 'http://localhost:8000';

function CardAttempt(props) {
    const [cardAttemptData, setCardAttemptData] = useState({});

    useEffect(() => {
        if(!cardAttemptData.question) {
            axios.get(`${baseURL}/card-attempts/${props.cardAttemptId}`)
                .then((response) => {
                    setCardAttemptData(response.data);
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, [cardAttemptData.question, props.cardAttemptId]);

    return (
            <div>
                <h3>Attempt Date: <em>{cardAttemptData.datePracticed}</em></h3>
                <p><strong>{cardAttemptData.question}</strong></p>
                <p>Correct Answer: {cardAttemptData.correctAnswer}</p>
                <p>Answered Correctly? <em>{cardAttemptData.answeredCorrectly?.toString()}</em></p>
                {(cardAttemptData.cardType !== "FlashCard" && !cardAttemptData.answeredCorrectly) && <p>Answer given: {cardAttemptData.wrongAnswerSelected}</p>}
            </div>
    );
}

CardAttempt.propTypes = {
    cardAttemptId: PropTypes.string
}

export default CardAttempt;