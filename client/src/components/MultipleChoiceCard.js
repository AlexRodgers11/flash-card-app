import React from 'react';
import { useSelector } from 'react-redux'
import useToggle from '../hooks/useToggle';
import Answer from './Answer';
import styled from 'styled-components';
import { HintBox, StyledHintIcon } from './StyledComponents/CardStyles';

const MultipleChoiceCardWrapper = styled.div`
	height: 100%;
`

const QuestionBox = styled.div`
	height: 40%;
	border-bottom: 1px solid black;
	background-color:  #2C262C;
	color: white;
`

const QuestionWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
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
`;

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
							<StyledHintIcon onClick={toggleShowHint} />			
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
