import axios from 'axios';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { resetDeck } from '../reducers/deckSlice';
import { addMemberSubmittedDeck } from '../reducers/decksSlice';
import { addDeckToUser } from '../reducers/loginSlice';
import styled from 'styled-components';

const baseURL = 'http://localhost:8000';

const DeckFormWrapper = styled.div`
	height: calc(100vh - 5.5rem);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	& form {
		display: flex;
		flex-direction: column;
		align-items: center;
		border: 2px solid black;
		border-radius: 2em;
		padding: 4rem 6rem 2rem 6rem;
		& div {
			margin: 1em 0;
		} 
		@media (max-width: 600px) {
			padding: 1rem 2rem .5rem 2rem;
		}
		@media (max-width: 330px) {
			padding: .25rem .5rem .125rem .5rem;	
		}
	}
	& input {
		@media (max-width: 600px) {
			display: block;
		}
	}
`;

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
	const [nameInput, clearNameInput, handleNameInputChange] = useFormInput('');
  	const [publiclyAvailable, clearPubliclyAvailable, handlePubliclyAvailableChange] = useFormInput("false");
	const listType = useSelector((state) => state.decks.listType);
	const dispatch = useDispatch();
	const navigate = useNavigate();
	let { userId } = useParams();


	const handleSubmit = (evt) => {
		evt.preventDefault();
		let newDeck = {
			deckName: nameInput,
			publiclyAvailable: publiclyAvailable === "true",
			creator: userId,
			dateCreated: new Date().toString()
		}
		clearNameInput();
		clearPubliclyAvailable();
		dispatch(resetDeck());
		axios.post(`${baseURL}/users/${userId}/decks`, newDeck)
			.then((response) => {
				dispatch(addDeckToUser({_id: response.data._id, name: response.data.name}));
				if(listType === "user") {
					dispatch(addMemberSubmittedDeck({deckId: response.data._id}));//this will be handled in dispatched action from decksSlice, or renamed if dispatched elsewhere
				}
				navigate(`/decks/${response.data._id}`);
			})
			.catch(err => console.error(err));

	}

	const handleCancelCreateDeck = () => {
		navigate(`/dashboard`);
	}

  	return (
		<DeckFormWrapper className="DeckFormWrapper">
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
					<ButtonWrapper>
						<button className="btn btn-danger" onClick={handleCancelCreateDeck}>Cancel</button>
						<button className="btn btn-primary" type="submit">Create</button>
					</ButtonWrapper>
				</form>
		</DeckFormWrapper>
  )
}

export default DeckForm