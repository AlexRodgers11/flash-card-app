import React from 'react';
import { useSelector } from 'react-redux'
import useToggle from '../hooks/useToggle';
import Answer from './Answer';

function MultipleChoiceCard() {
	const answered = useSelector((state) => state.practiceSession.cardAnswered);
	const activeCard = useSelector((state) => state.practiceSession.activeCard);
	const [showHint, toggleShowHint] = useToggle(false);

	return (
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
				<div>{activeCard?.question}</div>
				<div className="MultipleChoiceCard_Answers">
                    <div><Answer answer={activeCard.answers[0]} /></div>
                    <div><Answer answer={activeCard.answers[1]} /></div>
                    <div><Answer answer={activeCard.answers[2]} /></div>
                    <div><Answer answer={activeCard.answers[3]} /></div>
                </div>
			</div>
		</div>
	)
}

export default MultipleChoiceCard
