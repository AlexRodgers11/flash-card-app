import React, { useState } from 'react';
import PropTypes from 'prop-types';
import "./Answer.css";
import styled from "styled-components";
import { useDispatch, useSelector } from 'react-redux';
import { addCardAttempt, answerCard } from '../reducers/practiceSessionSlice';

const CardAnswer = styled.div`
        background-color: blue;
        color: orange;
    `

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
            dispatch(addCardAttempt({
                answeredCorrectly, 
                cardId: activeCard._id,
                correctAnswer: activeCard.correctAnswer,
                wrongAnswerSelected: answeredCorrectly ? "" : props.answer, 
                question: activeCard.question,
                cardType: activeCard.cardType,
                datePracticed: Date.now()}));
        }, 1000);
    }

    return (
        <div onClick={!answered ? checkAnswer : null} className={`${answered ? props.answer === activeCard.correctAnswer ? 'Answer_Correct Answered' : clicked  ? 'Answer_Incorrect Answered' : 'Answered' : 'Answer'}`} >
           {props.answer} 
        </div>
        // <CardAnswer onClick={!props.answered ? checkAnswer : null} className={`${props.answered ? props.answer === props.correctAnswer ? 'Answer_Correct Answered' : clicked  ? 'Answer_Incorrect Answered' : 'Answered' : 'Answer'}`} >
        //    {activeCard.answers[props.answerIndex]} 
        // </CardAnswer>
    )
}

Answer.propTypes = {
    answer: PropTypes.string
}

export default Answer
