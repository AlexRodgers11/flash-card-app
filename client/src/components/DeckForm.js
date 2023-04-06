import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { resetDeck } from '../reducers/deckSlice';
import { addDeckToCurrentDeckList } from '../reducers/decksSlice';
import { createDeck } from '../reducers/loginSlice';
import styled from 'styled-components';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const RadioWrapper = styled.div`
	display: flex;
	justify-content: center;
	& input {
		vertical-align: middle;
		width: 1rem;
	}
	& input:first-of-type {
		margin-right: 1.25rem;
	}
	& label {
		margin-right: .25rem;
	}
`;
	
const ButtonWrapper = styled.div`
	padding-top: 6rem;
	& button {
		margin: 0 1.5rem;
		@media (max-width: 330px) {
			margin: 0 .75rem;
		}
	}
	@media (max-width: 600px) {
		padding-top: 4rem;
	}
	@media (max-width: 330px) {
		padding-top: 2rem;
	}
`;

function DeckForm() {
	const privacyDefault = useSelector((state) => state.login.privacy.newDecks);
	const [nameInput, clearNameInput, handleNameInputChange] = useFormInput('');
  	const [publiclyAvailable, clearPubliclyAvailable, handlePubliclyAvailableChange] = useFormInput(privacyDefault === "public" ? "true" : "false");
	const [allowCopies, clearAllowCopies, handleAllowCopiesChange] = useFormInput("false");
	const listType = useSelector((state) => state.decks.listType);
	const userId = useSelector((state) => state.login.userId);
	const dispatch = useDispatch();
	const navigate = useNavigate();


	const handleSubmit = (evt) => {
		evt.preventDefault();
		let newDeck = {
			deckName: nameInput,
			publiclyAvailable: publiclyAvailable === "true",
			allowCopies: allowCopies === "true" && publiclyAvailable === "true",
			creator: userId,
			dateCreated: new Date().toString()
		}
		clearNameInput();
		clearPubliclyAvailable();
		clearAllowCopies();
		dispatch(resetDeck());
		console.log(`${baseURL}/users/${userId}/decks`);
		console.log({newDeck});

		dispatch(createDeck({deck: newDeck, userId}))
			.then((action) => {
				if(listType === "user") {
					dispatch(addDeckToCurrentDeckList({deckId: action.payload._id}));
				}
				navigate(`/decks/${action.payload._id}`);
			})
			.catch(err => console.error(err));
	}

	const handleCancelCreateDeck = () => {
		navigate(`/dashboard`);
	}

  	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label className="form-label" htmlFor="name">Deck Name:</label>
				<input  type="text" id="name" name="name" value={nameInput} onChange={handleNameInputChange} />
			</div>
			<RadioWrapper>
				<label className="form-label" htmlFor="public">Public</label>
				<input checked={publiclyAvailable==="true"} type="radio" id="public" name="publiclyAvailable" value="true" onChange={handlePubliclyAvailableChange} />
				<label className="form-label" htmlFor="private">Private</label>
				<input checked={publiclyAvailable==="false"} type="radio" id="private" name="publiclyAvailable" value="false" onChange={handlePubliclyAvailableChange} />
			</RadioWrapper>
			{publiclyAvailable==="true" &&
				<RadioWrapper>
					<label className="form-label" htmlFor="allow-copies">Allow Copies</label>
					<input checked={allowCopies==="true"} type="radio" id="allow-copies" name="allowCopies" value="true" onChange={handleAllowCopiesChange} />
					<label className="form-label" htmlFor="prevent-copies">Prohibit Copies</label>
					<input checked={allowCopies==="false"} type="radio" id="prevent-copies" name="allowCopies" value="false" onChange={handleAllowCopiesChange} />
				</RadioWrapper>
			}
			<ButtonWrapper>
				<button className="btn btn-danger" onClick={handleCancelCreateDeck}>Cancel</button>
				<button className="btn btn-primary" type="submit">Create</button>
			</ButtonWrapper>
		</form>
  )
}

export default DeckForm