import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useToggle from '../hooks/useToggle';
import { addCardAttempt } from '../reducers/practiceSessionSlice';
import styled from 'styled-components';

// const FlashCardWrapper = styled.div`
// 	display: flex;
// 	flex-direction: column;
// 	justify-content: space-between;
// 	height: 100%;
// 	padding: 15% 5%;
// `

const HintBox = styled.div`
	position: absolute;
	width: 28rem;
	text-align: left;
	& button {
		margin: .5rem;
	}
	& p {
		display: inline-block;
		margin-left: .5rem;
		font-style: italic;
		font-size: .75rem 	;
		word-wrap: break-word;
		overflow-wrap: break-word; 
	}
`

const CardWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	height: 100%;
	padding: 30% 5%;
	// background-color: white;
	background-color:  #2C262C;
	color: white;
	& button {
		margin: .25rem;
		padding: .5rem 1.25rem;
	}
	 & .view-answer {
		background-color: #E3DEE3;
		&:hover {
			background-color: black;
			color: white;
		}
	 }
	 & .answered-correctly {
		color: white;
		background-color: #333FFF;
		&:hover {
			background-color: black;
		}
	 }
	 & .answered-incorrectly {
		color: white;
		background-color: #FF3333;
		&:hover {
			background-color: black;
		}
	 }
`

function FlashCard() {
	const [answered, setAnswered] = useState(false);
	const [showAnswer, setShowAnswer] = useState(false);
	const activeCard = useSelector((state) => state.practiceSession.activeCard);
	const [showHint, toggleShowHint] = useToggle(false);
	const dispatch = useDispatch();

	const submitAnswer = (evt) => {
		let answeredCorrectly = evt.target.dataset.answeredcorrectly === "true" ? true : false;  
		setAnswered(true);
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
			setShowAnswer(false);
			setAnswered(false);
		}, 1000);
	}

	return (
		<>
			{!showAnswer ?
				<>	
					{activeCard?.hint? 
						<HintBox>
							<button onClick={toggleShowHint}>Hint</button>
							{showHint ? <p>{activeCard?.hint}</p> : null}
							
						</HintBox>
						:
						null
					}
					<CardWrapper>
						<div>{activeCard.question}</div>
						<div>
							{/* <button className="view-answer" onClick={toggleShowAnswer}>View Answer</button> */}
							<button className="view-answer" onClick={() => setShowAnswer(true)}>View Answer</button>
						</div>
					</CardWrapper>
				</>
				:
				<>
					<CardWrapper>
						<div>{activeCard.correctAnswer}</div>
						<div>
							<h3>Did you answer correctly?</h3>
							<button className="answered-correctly" data-answeredcorrectly="true" onClick={!answered ? submitAnswer : undefined}>Yes</button>
							<button className="answered-incorrectly" data-answeredcorrectly="false" onClick={!answered ? submitAnswer : undefined}>No</button>
						</div>
					</CardWrapper>
				</>
			}
		</>
	)
}

export default FlashCard
