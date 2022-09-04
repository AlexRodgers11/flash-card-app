import axios from 'axios';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { addDeck } from '../reducers/decksSlice';

const baseURL = 'http://localhost:8000';


function DeckForm() {
  	const [nameInput, clearNameInput, handleNameInputChange] = useFormInput('');
  	const [privacy, clearPrivacy, handlePrivacyChange] = useFormInput("false");
	const dispatch = useDispatch();
	const navigate = useNavigate();
	let { userId } = useParams();


	const handleSubmit = (evt) => {
		evt.preventDefault();
		let newDeck = {
			deckName: nameInput,
			public: privacy === "true",
			creator: userId,
			dateCreated: new Date().toString()
		}
		clearNameInput();
		clearPrivacy();
		axios.post(`${baseURL}/users/${userId}/decks`, newDeck)
			.then((response) => {
				let deckId = response.data;
				dispatch(addDeck({deckId}));
				navigate(`/decks/${deckId}`);
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
						<input checked={privacy==="true"} type="radio" id="public" name="privacy" value="true" onChange={handlePrivacyChange} />
						<label htmlFor="private">Private</label>
						<input checked={privacy==="false"} type="radio" id="private" name="privacy" value="false" onChange={handlePrivacyChange} />
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