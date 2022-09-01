import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import useToggle from '../hooks/useToggle';
import Answer from './Answer';
import { shuffleArray } from '../utils';

function MultipleChoiceCard(props) {
	const [answered, setAnswered] = useState(false);
	const [showHint, toggleShowHint] = useToggle(false);
	const practiceSet = useSelector((state) => state.practiceSession.practiceSet);
	const [answers, setAnswers] = useState([]);

	useEffect(() => {
		setAnswers(shuffleArray([practiceSet[props.cardIndex].correctAnswer, practiceSet[props.cardIndex].wrongAnswerOne, practiceSet[props.cardIndex].wrongAnswerTwo, practiceSet[props.cardIndex].wrongAnswerThree]));
	}, [practiceSet, props.cardIndex]);

	const handleCheckAnswer = answer => {
        setAnswered(true);
        let isCorrect = answer === practiceSet[props.cardIndex].correctAnswer;
		console.log({isCorrect});
        setTimeout(() => {
            props.answerCard(isCorrect);
			setAnswered(false);
        }, 1000);
    }

	return (
		<div>
			<div>
				{practiceSet[props.cardIndex].hint && !answered ? 
					<div>
						<button onClick={toggleShowHint}>Hint</button>
						{showHint ? <p>{practiceSet[props.cardIndex].hint}</p> : null}
					</div>
					:
					null
				}
				<div>{practiceSet[props.cardIndex].question}</div>
				<div className="MultipleChoiceCard_Answers">
                    <p><Answer answer={answers[0]} answered={answered} correctAnswer={practiceSet[props.cardIndex].correctAnswer} checkAnswer={handleCheckAnswer} /></p>
                    <p><Answer answer={answers[1]} answered={answered} correctAnswer={practiceSet[props.cardIndex].correctAnswer} checkAnswer={handleCheckAnswer} /></p>
                    <p><Answer answer={answers[2]} answered={answered} correctAnswer={practiceSet[props.cardIndex].correctAnswer} checkAnswer={handleCheckAnswer} /></p>
                    <p><Answer answer={answers[3]} answered={answered} correctAnswer={practiceSet[props.cardIndex].correctAnswer} checkAnswer={handleCheckAnswer} /></p>
                </div>
			</div>
		</div>
	)
}

MultipleChoiceCard.propTypes = {
    answerCard: PropTypes.func,
	cardIndex: PropTypes.number
}

export default MultipleChoiceCard
