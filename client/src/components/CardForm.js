import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import useFormInput from '../hooks/useFormInput';

const baseURL = 'http://localhost:8000';

function CardForm(props) {
	const [isLoaded, setIsLoaded] = useState(false);
	const [type, clearType, handleChangeType, setType] = useFormInput("")
	const [question, clearQuestion, handleChangeQuestion, setQuestion] = useFormInput("");
	const [hint, clearHint, handleChangeHint, setHint] = useFormInput("");
	const [correctAnswer, clearCorrectAnswer, handleChangeCorrectAnswer, setCorrectAnswer] = useFormInput("");
	const [wrongAnswerOne, clearWrongAnswerOne, handleChangeWrongAnswerOne,setWrongAnswerOne] = useFormInput("");
	const [wrongAnswerTwo, clearWrongAnswerTwo, handleChangeWrongAnswerTwo, setWrongAnswerTwo] = useFormInput("");
	const [wrongAnswerThree, clearWrongAnswerThree ,handleChangeWrongAnswerThree, setWrongAnswerThree] = useFormInput("");

	const handleSubmit = evt => {
		evt.preventDefault();
		let card = {
			type, 
			question,
			correctAnswer,
			wrongAnswerOne,
			wrongAnswerTwo,
			wrongAnswerThree,
			hint
		}
		clearType();
		clearQuestion();
		clearHint();
		clearCorrectAnswer();
		clearWrongAnswerOne();
		clearWrongAnswerTwo();
		clearWrongAnswerThree();
		props.submit(card);
		
	}

	useEffect(() => {
		if(!isLoaded && props.cardId) {
			axios.get(`${baseURL}/cards/${props.cardId}`)
				.then((response) => {
					let card = response.data;
					setType(card.type);
					setQuestion(card.question);
					setCorrectAnswer(card.correctAnswer);
					if(card.type !== "flash") {
						setWrongAnswerOne(card.wrongAnswerOne);
					}
					if(card.type === "multiple-choice") {
						setWrongAnswerTwo(card.wrongAnswerTwo);
						setWrongAnswerThree(card.wrongAnswerThree);
					}
					setIsLoaded(true);
				})
				.catch(err => {
					console.error(err);
				});
		} else if(!isLoaded && !props.cardId) {
			console.log("else condition met");
			setIsLoaded(true);
		} else {
			console.log("final else condition met");
		}
	}, [isLoaded, props.cardId, setCorrectAnswer, setHint, setIsLoaded, setQuestion, setType, setWrongAnswerOne, setWrongAnswerThree, setWrongAnswerTwo]);
  
	return (
		<div>
			{!isLoaded ? 
				null
				:
				<form onSubmit={handleSubmit}>
					<div>

						<label htmlFor="type">Card Type: </label>
                        <select id="type" name="type" value={type} onChange={handleChangeType}>
                            <option selected value={null}></option>
                            <option value="flash">Flash Card</option>
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                        </select>
					</div>
					<div>
						<label htmlFor='question'>Question</label>
						<textarea type='text' name='question' id='question' value={question} onChange={handleChangeQuestion} />
					</div>
					<div>
						<label htmlFor='hint'>Hint (optional)</label>
						<textarea type='text' name='hint' id='hint' value={hint} onChange={handleChangeHint}/>
					</div>
					<div>
						{type === 'true-false' ? 
							<>
								<label htmlFor="true-false-options">Answer</label>
								<div id="true-false-options">
									<input 
										type="radio" 
										id="correct-answer-true" 
										name="true-false-correct-answer" 
										value="True" checked={correctAnswer === "True"} 
										onChange={handleChangeCorrectAnswer} 
									/>
									<label htmlFor="correct-answer-true">True</label>
									<input 
										type="radio" 
										id="correct-answer-false" 
										name="true-false-correct-answer" 
										value="False" 
										checked={correctAnswer === "False"} 
										onChange={handleChangeCorrectAnswer} 
									/>
									<label htmlFor="correct-answer-false">False</label>
								</div>
							</>
							:
							<>
								<label htmlFor="correct-answer">{type === 'multiple-choice' ? 'Correct ' : ''}Answer</label>
								<textarea id="correct-answer" name="correct-answer" value={correctAnswer} onChange={handleChangeCorrectAnswer} />
							</>
						} 
					</div>
					{type !== 'multiple-choice' ?
						null
						:
						<div>
							<div>
								<label htmlFor="wrong-answer-one">Wrong Answer #1</label>
								<textarea id="wrong-answer-one" name="wrong-answer-one" value={wrongAnswerOne} onChange={handleChangeWrongAnswerOne} />
							</div>
							<div>
								<label htmlFor="wrong-answer-two">Wrong Answer #2</label>
								<textarea id="wrong-answer-two" name="wrong-answer-two" value={wrongAnswerTwo} onChange={handleChangeWrongAnswerTwo} />
							</div>
							<div>
								<label htmlFor="wrong-answer-three">Wrong Answer #3</label>
								<textarea id="wrong-answer-three" name="wrong-answer-three" value={wrongAnswerThree} onChange={handleChangeWrongAnswerThree} />
							</div>
						</div>
					}
					<button type="submit">Submit</button>
				</form>
			}
		</div>
	)
}


export default CardForm
