import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types'
import useToggle from '../hooks/useToggle';

function FlashCard(props) {
  const [answered, toggleAnswered] = useToggle(false);
	const [showHint, toggleShowHint] = useToggle(false);
	const practiceSet = useSelector((state) => state.practiceSession.practiceSet);

  const handleAnswerCorrectly = () => {
    props.answerCard(true);
    toggleAnswered();
  }

  const handleAnswerIncorrectly = () => {
    props.answerCard(false);
  }

  return (
    <div>
      {!answered ?
        <div>
          <div>
            {props.hint ? 
              <div>{practiceSet[props.cardIndex].hint}</div> : null
            }
            <div>{practiceSet[props.cardIndex].question}</div>
            <div>
                <button onClick={toggleAnswered}>View Answer</button>
            </div>
          </div>
        </div>
        :
        <>
        <div>{practiceSet[props.cardIndex].correctAnswer}</div>
        <div>
          <h3>Did you answer correctly?</h3>
          <button onClick={handleAnswerCorrectly}>Yes</button>
          <button onClick={handleAnswerIncorrectly}>No</button>
        </div>
        </>
      }
    </div>
  )
}

FlashCard.propTypes = {
    card: PropTypes.object,
    answerCard: PropTypes.func
}

export default FlashCard
