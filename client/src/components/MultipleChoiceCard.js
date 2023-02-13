import React from 'react';
import { useSelector } from 'react-redux'
import useToggle from '../hooks/useToggle';
import Answer from './Answer';
import styled from 'styled-components';

const MultipleChoiceCardWrapper = styled.div`
	height: 100%;
`

const QuestionBox = styled.div`
	height: 40%;
	border-bottom: 1px solid black;
	// background-color: #FFD549;
	// background-color: #A3A5B8;
	// background-color: #757895;
	// background-color: #58355E;
	// background-color: #6A6E8A;
	background-color:  #2C262C;

	// color: black;
	color: white;
`

const QuestionWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
`

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

const AnswerBox = styled.div`
	height: 60%;
`

const AnswerWrapper = styled.div`
	height: 25%;
	border-bottom: .25px solid black;
	&:first-child {
		border-top: none;
	}
	&:last-child {
		border-bottom: none
	}
`

function MultipleChoiceCard() {
	const answered = useSelector((state) => state.practiceSession.cardAnswered);
	const activeCard = useSelector((state) => state.practiceSession.activeCard);
	const [showHint, toggleShowHint] = useToggle(false);

	return (
		<MultipleChoiceCardWrapper>
			<QuestionBox>
				<HintBox>
					{activeCard?.hint && !answered ? 
						<div>
							<button onClick={toggleShowHint}>Hint</button>
							{showHint ? <p>{activeCard?.hint}</p> : null}
						</div>
						:
						null
					}
				</HintBox>
				<QuestionWrapper>{activeCard?.question}</QuestionWrapper>
			</QuestionBox>
			<AnswerBox>
				<AnswerWrapper><Answer answer={activeCard.answers[0]} /></AnswerWrapper>
				<AnswerWrapper><Answer answer={activeCard.answers[1]} /></AnswerWrapper>
				<AnswerWrapper><Answer answer={activeCard.answers[2]} /></AnswerWrapper>
				<AnswerWrapper><Answer answer={activeCard.answers[3]} /></AnswerWrapper>
			</AnswerBox>
		</MultipleChoiceCardWrapper>
	)
}

export default MultipleChoiceCard
