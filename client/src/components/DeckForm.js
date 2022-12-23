import axios from 'axios';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { addDeck } from '../reducers/decksSlice';
import { addDeckToUser } from '../reducers/loginSlice';

const baseURL = 'http://localhost:8000';


function DeckForm() {
  	const [nameInput, clearNameInput, handleNameInputChange] = useFormInput('');
  	const [publiclyAvailable, clearPubliclyAvailable, handlePubliclyAvailableChange] = useFormInput("false");
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
		axios.post(`${baseURL}/users/${userId}/decks`, newDeck)
			.then((response) => {
				dispatch(addDeckToUser({_id: response.data._id, name: response.data.name}));
				dispatch(addDeck({deckId: response.data._id}));
				navigate(`/decks/${response.data._id}`);
			})
			.catch(err => console.error(err));

	}

	const handleCancelCreateDeck = () => {
		navigate(`/dashboard`);
	}

  	return (
		<div>
			<form onSubmit={handleSubmit}>
					<div>
						<label htmlFor="name">Deck Name</label>
						<input type="text" id="name" name="name" value={nameInput} onChange={handleNameInputChange} />
					</div>
					<div>
						<label htmlFor="public">Public</label>
						<input checked={publiclyAvailable==="true"} type="radio" id="public" name="publiclyAvailable" value="true" onChange={handlePubliclyAvailableChange} />
						<label htmlFor="private">Private</label>
						<input checked={publiclyAvailable==="false"} type="radio" id="private" name="publiclyAvailable" value="false" onChange={handlePubliclyAvailableChange} />
					</div>
					<div>
						<button onClick={handleCancelCreateDeck}>Cancel</button>
						<button type="submit">Create</button>
					</div>
				</form>
		</div>
  )
}

export default DeckForm