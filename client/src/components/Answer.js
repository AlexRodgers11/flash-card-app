import React, { useState } from 'react';
import PropTypes from 'prop-types';
import "./Answer.css";

function Answer(props) {
    const [clicked, setClicked] = useState(false);

    const handleSelectAnswer = () => {
        console.log("handleSelectAnswer ran")
        setClicked(true);
        props.checkAnswer(props.answer);
    }

    return (
        // <div onClick={!props.answered ? handleSelectAnswer : null} className={`${props.answered ? props.answer === props.correctAnswer ? 'Answer_Correct Answered' : clicked ? 'Answer_Incorrect Answered': 'Answered' : 'Answer'}`}>
        <div onClick={!props.answered ? handleSelectAnswer : null} className={`${props.answered ? props.answer === props.correctAnswer ? 'Answer_Correct Answered' : clicked  ? 'Answer_Incorrect Answered' : 'Answered' : 'Answer'}`} >
           {props.answer} 
        </div>
    )
}

Answer.propTypes = {
    answer: PropTypes.string,
    answered: PropTypes.bool,
    correctAnswer: PropTypes.string,
    checkAnswer: PropTypes.func
}

export default Answer
