import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types'
import useToggle from '../hooks/useToggle';
import Answer from './Answer';

function TrueFalseCard(props) {
	const [answered, setAnswered] = useState(false);
	const [showHint, toggleShowHint] = useToggle(false);
	const practiceSet = useSelector((state) => state.practiceSession.practiceSet);

	const handleCheckAnswer = answer => {
        setAnswered(true);
        let isCorrect = answer === practiceSet[props.cardIndex].correctAnswer;
		console.log({isCorrect});
        setTimeout(() => {
            // props.answerCard(isCorrect, practiceSet[props.cardIndex]._id);
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
				<div className="TrueFalseCard_Answers">
                    <p><Answer answer="True" answered={answered} correctAnswer={practiceSet[props.cardIndex].correctAnswer} checkAnswer={handleCheckAnswer} /></p>
                    <p><Answer answer="False" answered={answered} correctAnswer={practiceSet[props.cardIndex].correctAnswer} checkAnswer={handleCheckAnswer} /></p>
                </div>
			</div>
		</div>
	)
}

TrueFalseCard.propTypes = {
    answerCard: PropTypes.func,
	cardIndex: PropTypes.number
}

export default TrueFalseCard
