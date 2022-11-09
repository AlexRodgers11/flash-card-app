import React from 'react';
import { useSelector } from 'react-redux';
import useToggle from '../hooks/useToggle';
import Answer from './Answer';

function TrueFalseCard() {
	const answered = useSelector((state) => state.practiceSession.cardAnswered);
	const [showHint, toggleShowHint] = useToggle(false);

	const activeCard = useSelector((state) => state.practiceSession.activeCard);

	return (
		<div>
			<div>
				{activeCard.hint && !answered ? 
					<div>
						<button onClick={toggleShowHint}>Hint</button>
						{showHint ? <p>{activeCard.hint}</p> : null}
					</div>
					:
					null
				}
				<div>{activeCard.question}</div>
				<div className="TrueFalseCard_Answers">
                    <div><Answer answer="True" /></div>
                    <div><Answer answer="False" /></div>
                </div>
			</div>
		</div>
	)
}

export default TrueFalseCard
