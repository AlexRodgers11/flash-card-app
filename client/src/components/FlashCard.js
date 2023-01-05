import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useToggle from '../hooks/useToggle';
import { addCardAttempt } from '../reducers/practiceSessionSlice';

function FlashCard() {
	const [answered, toggleAnswered] = useToggle(false);
	const activeCard = useSelector((state) => state.practiceSession.activeCard);
	const [showHint, toggleShowHint] = useToggle(false);
	const dispatch = useDispatch();

	const submitAnswer = (evt) => {
		let answeredCorrectly = evt.target.dataset.answeredcorrectly === "true" ? true : false;  
		setTimeout(() => {
			dispatch(addCardAttempt({
				answeredCorrectly, 
				cardId: activeCard._id,
				correctAnswer: activeCard.correctAnswer,
				wrongAnswerSelected: "",
				question: activeCard.question,
				cardType: "FlashCard",
				datePracticed: Date.now()
			}));
			toggleAnswered();
		}, 1000);
	}

	return (
		<div>
			{!answered ?
				<div>
					<div>
						{activeCard?.hint && !answered ? 
							<div>
								<button onClick={toggleShowHint}>Hint</button>
								{showHint ? <p>{activeCard?.hint}</p> : null}
								
							</div>
							:
							null
						}
						<div>{activeCard.question}</div>
						<div>
							<button onClick={toggleAnswered}>View Answer</button>
						</div>
					</div>
				</div>
				:
				<>
					<div>{activeCard.correctAnswer}</div>
					<div>
						<h3>Did you answer correctly?</h3>
						<button data-answeredcorrectly="true" onClick={submitAnswer}>Yes</button>
						<button data-answeredcorrectly="false" onClick={submitAnswer}>No</button>
					</div>
				</>
			}
		</div>
	)
}

export default FlashCard
