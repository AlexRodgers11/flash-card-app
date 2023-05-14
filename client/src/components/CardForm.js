import React, { useEffect, useState } from 'react';
import useFormInput from '../hooks/useFormInput';
import { ErrorMessage } from './StyledComponents/ErrorMessage';
import { client } from '../utils';
import { useSelector } from 'react-redux';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function CardForm(props) {
	const [isLoaded, setIsLoaded] = useState(false);
	const [errorMessage, setErrorMessage] = useState();
	const [cardType, clearCardType, handleChangeCardType, setCardType] = useFormInput("FlashCard")
	const [question, clearQuestion, handleChangeQuestion, setQuestion] = useFormInput("");
	const [hint, clearHint, handleChangeHint, setHint] = useFormInput("");
	const [correctAnswer, clearCorrectAnswer, handleChangeCorrectAnswer, setCorrectAnswer] = useFormInput("");
	const [wrongAnswerOne, clearWrongAnswerOne, handleChangeWrongAnswerOne,setWrongAnswerOne] = useFormInput("");
	const [wrongAnswerTwo, clearWrongAnswerTwo, handleChangeWrongAnswerTwo, setWrongAnswerTwo] = useFormInput("");
	const [wrongAnswerThree, clearWrongAnswerThree ,handleChangeWrongAnswerThree, setWrongAnswerThree] = useFormInput("");
	const groupDeckBelongsTo = useSelector((state) => state.deck.groupDeckBelongsTo);

	const allAnswersAreUnique = (ans1, ans2, ans3, ans4) => {
		if(ans1 === ans2 || ans1 === ans3) {
			return false;
		}
		if(ans1 === ans4 || ans2 === ans3) {
			return false;
		}
		if(ans2 === ans4 || ans3 === ans4) {
			return false;
		}
		return true;
	}

	const handleSubmit = evt => {
		evt.preventDefault();
		let card = {
			cardType, 
			question,
			correctAnswer,
			wrongAnswerOne,
			wrongAnswerTwo,
			wrongAnswerThree,
			hint,
			...(groupDeckBelongsTo && {groupCardBelongsTo: groupDeckBelongsTo})
		}
		if(cardType !== "MultipleChoiceCard" || allAnswersAreUnique(correctAnswer, wrongAnswerOne, wrongAnswerTwo, wrongAnswerThree)) {
			clearCardType();
			clearQuestion();
			clearHint();
			clearCorrectAnswer();
			clearWrongAnswerOne();
			clearWrongAnswerTwo();
			clearWrongAnswerThree();
			setErrorMessage("");
			console.log({card});
			props.submit(card);
		} else {
			setErrorMessage("No two answers can be the same");
		} 
	}

	useEffect(() => {
		if(!isLoaded && props.cardId) {
			client.get(`${baseURL}/cards/${props.cardId}`)
				.then((response) => {
					let card = response.data;
					setCardType(card.cardType);
					setQuestion(card.question);
					setCorrectAnswer(card.correctAnswer);
					if(card.cardType !== "FlashCard") {
						setWrongAnswerOne(card.wrongAnswerOne);
					}
					if(card.cardType === "MultipleChoiceCard") {
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
	}, [isLoaded, props.cardId, setCorrectAnswer, setHint, setIsLoaded, setQuestion, setCardType, setWrongAnswerOne, setWrongAnswerThree, setWrongAnswerTwo]);
  
	return (
		<div>
			{!isLoaded ? 
				null
				:
				<form onSubmit={handleSubmit}>
					<div>

						<label htmlFor="type">Card Type: </label>
                        <select id="type" name="type" value={cardType} onChange={handleChangeCardType}>
                            <option selected value="FlashCard">Flash Card</option>
                            <option value="MultipleChoiceCard">Multiple Choice</option>
                            <option value="TrueFalseCard">True/False</option>
                        </select>
					</div>
					<div>
						<label htmlFor='question'>Question</label>
						<textarea required type='text' name='question' id='question' value={question} onChange={handleChangeQuestion} />
					</div>
					<div>
						<label htmlFor='hint'>Hint (optional)</label>
						<textarea type='text' name='hint' id='hint' value={hint} onChange={handleChangeHint}/>
					</div>
					<div>
						{cardType === 'TrueFalseCard' ? 
							<>
								<label htmlFor="true-false-options">Answer</label>
								<div id="true-false-options">
									<input 
										type="radio" 
										required
										id="correct-answer-true" 
										name="true-false-correct-answer" 
										value="True" checked={correctAnswer === "True"} 
										onChange={handleChangeCorrectAnswer} 
									/>
									<label htmlFor="correct-answer-true">True</label>
									<input 
										type="radio" 
										required
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
								<label htmlFor="correct-answer">{cardType === 'MultipleChoiceCard' ? 'Correct ' : ''}Answer</label>
								<textarea required id="correct-answer" name="correct-answer" value={correctAnswer} onChange={handleChangeCorrectAnswer} />
							</>
						} 
					</div>
					{cardType !== 'MultipleChoiceCard' ?
						null
						:
						<div>
							<div>
								<label htmlFor="wrong-answer-one">Wrong Answer #1</label>
								<textarea required id="wrong-answer-one" name="wrong-answer-one" value={wrongAnswerOne} onChange={handleChangeWrongAnswerOne} />
							</div>
							<div>
								<label htmlFor="wrong-answer-two">Wrong Answer #2</label>
								<textarea required id="wrong-answer-two" name="wrong-answer-two" value={wrongAnswerTwo} onChange={handleChangeWrongAnswerTwo} />
							</div>
							<div>
								<label htmlFor="wrong-answer-three">Wrong Answer #3</label>
								<textarea required id="wrong-answer-three" name="wrong-answer-three" value={wrongAnswerThree} onChange={handleChangeWrongAnswerThree} />
							</div>
						</div>
					}
					<button type="submit">{props.buttonText || "Add Card"}</button>
					{errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
				</form>
			}
		</div>
	)
}


export default CardForm
