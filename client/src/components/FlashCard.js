import React from 'react';
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
	& button {
		margin: .25rem;
		padding: .5rem 1.25rem;
	}
`

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
		<>
			{!answered ?
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
							<button onClick={toggleAnswered}>View Answer</button>
						</div>
					</CardWrapper>
				</>
				:
				<>
					<CardWrapper>
						<div>{activeCard.correctAnswer}</div>
						<div>
							<h3>Did you answer correctly?</h3>
							<button data-answeredcorrectly="true" onClick={submitAnswer}>Yes</button>
							<button data-answeredcorrectly="false" onClick={submitAnswer}>No</button>
						</div>
					</CardWrapper>
				</>
			}
		</>
	)
}

export default FlashCard
