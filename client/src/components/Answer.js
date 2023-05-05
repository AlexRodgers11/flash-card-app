import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styled from "styled-components";
import { useDispatch, useSelector } from 'react-redux';
import { addCardAttempt, answerCard } from '../reducers/practiceSessionSlice';

const CardAnswer = styled.div`
    display: flex;
    flex-shrink: 1;
    overflow: auto ;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background-color: white;
    // background-color: #FAF9FA;
    &:hover {
        background-color: black;
        color: white;
        cursor: pointer;
    }
    &.Answer_Correct {
        // background-color: blue;
        // background-color: #3333CC;
        background-color: #333FFF;
        color: white;
    }
    &.Answer_Incorrect {
        // background-color: red;
        // background-color: #CC3333;
        background-color: #FF3333;
        color: white;
    }
`

function Answer(props) {
    const [clicked, setClicked] = useState(false);
    const activeCard = useSelector((state) => state.practiceSession.activeCard);
    const answered = useSelector((state) => state.practiceSession.cardAnswered);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log("useEffect loop ran")
    }, []);

    const checkAnswer = () => {
        console.log(`${props.answer} was clicked`);
        dispatch(answerCard());
        setClicked(true);
        setTimeout(() => {
            let answeredCorrectly = props.answer === activeCard.correctAnswer;
            dispatch(addCardAttempt({
                    answeredCorrectly, 
                    cardId: activeCard._id,
                    correctAnswer: activeCard.correctAnswer,
                    wrongAnswerSelected: answeredCorrectly ? "" : props.answer, 
                    question: activeCard.question,
                    cardType: activeCard.cardType,
                    datePracticed: Date.now()
                })
            );
            setClicked(false);
        }, 2500);
        // }, 10000);
    }

    return (
        <CardAnswer role="button" onClick={!answered ? checkAnswer : null} className={`${answered ? props.answer === activeCard.correctAnswer ? 'Answer_Correct Answered' : clicked  ? 'Answer_Incorrect Answered' : 'Answered' : 'Answer'}`} >
           {props.answer} 
        </CardAnswer>
    )
}

Answer.propTypes = {
    answer: PropTypes.string
}

export default Answer
