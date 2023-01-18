import React from 'react';
import { useSelector } from 'react-redux';
import useToggle from '../hooks/useToggle';
import Answer from './Answer';
import styled from 'styled-components';

const TrueFalseCardWrapper = styled.div`
	height: 100%;
`

const QuestionBox = styled.div`
	height: 45%;
	width: 100%;
	border-bottom: 1px solid black;
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
	height: 55%;
`

const AnswerWrapper = styled.div`
	height: 50%;
	border-bottom: .25px solid black;

	&:first-child {
		border-top: none;
	}
	&:last-child {
		border-bottom: none
	}
`

const QuestionWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
`

function TrueFalseCard() {
	const answered = useSelector((state) => state.practiceSession.cardAnswered);
	const [showHint, toggleShowHint] = useToggle(false);

	const activeCard = useSelector((state) => state.practiceSession.activeCard);

	return (
		<TrueFalseCardWrapper>
			<QuestionBox>
				<HintBox>
					{activeCard.hint && !answered ? 
						<>
							<button onClick={toggleShowHint}>Hint</button>
							{showHint ? <p>{activeCard.hint}</p> : null}
						</>
						:
						null
					}
				</HintBox>
				<QuestionWrapper>{activeCard.question}</QuestionWrapper>
			</QuestionBox>
			<AnswerBox>
				<AnswerWrapper><Answer answer="True" /></AnswerWrapper>
				<AnswerWrapper><Answer answer="False" /></AnswerWrapper>
			</AnswerBox>
		</TrueFalseCardWrapper>
	)
}

export default TrueFalseCard
