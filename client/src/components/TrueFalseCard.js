import React from 'react';
import { useSelector } from 'react-redux';
import useToggle from '../hooks/useToggle';
import Answer from './Answer';
import styled from 'styled-components';
import { HintBox, StyledHintIcon } from './StyledComponents/CardStyles';

const TrueFalseCardWrapper = styled.div`
	height: 100%;
`

const QuestionBox = styled.div`
	height: 45%;
	width: 100%;
	border-bottom: 1px solid black;
	background-color: #2C262C;
	color: white;
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
							<StyledHintIcon onClick={toggleShowHint} />
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
