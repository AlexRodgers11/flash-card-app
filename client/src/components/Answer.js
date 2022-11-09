import React, { useState } from 'react';
import PropTypes from 'prop-types';
import "./Answer.css";
import { useDispatch, useSelector } from 'react-redux';
import { addCardAttempt, answerCard } from '../reducers/practiceSessionSlice';


function Answer(props) {
    const [clicked, setClicked] = useState(false);
    const activeCard = useSelector((state) => state.practiceSession.activeCard);
    const answered = useSelector((state) => state.practiceSession.cardAnswered);
    const dispatch = useDispatch();

    const checkAnswer = () => {
        setClicked(true);
        dispatch(answerCard);
        setTimeout(() => {
            let answeredCorrectly = props.answer === activeCard.correctAnswer;
            dispatch(addCardAttempt({answeredCorrectly, cardId: activeCard._id}))
        }, 1000);
    }

    return (
        <div onClick={!answered ? checkAnswer : null} className={`${answered ? props.answer === activeCard.correctAnswer ? 'Answer_Correct Answered' : clicked  ? 'Answer_Incorrect Answered' : 'Answered' : 'Answer'}`} >
           {props.answer} 
        </div>
    )
}

Answer.propTypes = {
    answer: PropTypes.string
}

export default Answer
