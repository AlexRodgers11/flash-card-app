import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import useFormInput from "../hooks/useFormInput";
import { resetDeck } from "../reducers/deckSlice";
import { addDeckToCurrentDeckList } from "../reducers/decksSlice";
import { createDeck } from "../reducers/loginSlice";
import styled from "styled-components";

const DeckFormWrapper = styled.form`
	text-align: left;
    & div {
        margin-top: .5rem;
    }
    & .form-label {
        margin-bottom: 1px;
    }
`;
	
const ButtonWrapper = styled.div`
	display: flex;
	justify-content: space-around;
	padding-top: 2.5rem;
	& button {
		// margin: 0 1.5rem;
		// @media (max-width: 330px) {
		// 	margin: 0 .75rem;
		// }
	}
	// @media (max-width: 600px) {
	// 	padding-top: 4rem;
	// }
	@media (max-width: 330px) {
		padding-top: 2rem;
	}
`;

function DeckForm() {
	const privacyDefault = useSelector((state) => state.login.privacy.newDecks);
	const [nameInput, clearNameInput, handleNameInputChange] = useFormInput("");
  	const [publiclyAvailable, clearPubliclyAvailable, handlePubliclyAvailableChange] = useFormInput(privacyDefault === "public" ? true : false, "checkbox");
	const [allowCopies, clearAllowCopies, handleAllowCopiesChange] = useFormInput(false, "checkbox");
	const listType = useSelector((state) => state.decks.listType);
	const userId = useSelector((state) => state.login.userId);
	const dispatch = useDispatch();
	const navigate = useNavigate();


	const handleSubmit = (evt) => {
		evt.preventDefault();
		let newDeck = {
			deckName: nameInput,
			publiclyAvailable: publiclyAvailable,
			allowCopies: allowCopies && publiclyAvailable,
			creator: userId,
			dateCreated: new Date().toString()
		}
		clearNameInput();
		clearPubliclyAvailable();
		clearAllowCopies();
		dispatch(resetDeck());
		dispatch(createDeck({deck: newDeck, userId}))
			.then((action) => {
				if(listType === "user") {
					dispatch(addDeckToCurrentDeckList({deckId: action.payload._id}));
				}
				navigate(`/users/${userId}/decks/${action.payload._id}`);
			})
			.catch(err => console.error(err));
	}

	const handleCancelCreateDeck = () => {
		navigate(`/dashboard`);
	}

  	return (
		<DeckFormWrapper onSubmit={handleSubmit}>
			<div>
				<label className="form-label" htmlFor="name">Deck Name</label>
				<input required className="form-control" type="text" id="name" name="name" value={nameInput} onChange={handleNameInputChange} />
			</div>
			<div className="form-check form-switch">
				<input style={{display: "inline-block"}} role="button" onChange={handlePubliclyAvailableChange} checked={publiclyAvailable} className="form-control form-check-input" type="checkbox" id="publicly-available-switch" />
				<label className="form-check-label" htmlFor="publicly-available-switch">{publiclyAvailable ? "Public" : "Private"}</label>
			</div>
			{publiclyAvailable && 
				<div className="form-check form-switch">
					<input style={{display: "inline-block"}} role="button" onChange={handleAllowCopiesChange} checked={allowCopies} className="form-control form-check-input" type="checkbox" id="allow-copies-switch" />
					<label className="form-check-label" htmlFor="allow-copies-switch">{allowCopies ? "Allow Copies" : "Don't Allow Copies"}</label>
				</div>
			}
			<ButtonWrapper>
				<button className="btn btn-danger" onClick={handleCancelCreateDeck}>Cancel</button>
				<button className="btn btn-primary" type="submit">Create</button>
			</ButtonWrapper>
		</DeckFormWrapper>
  )
}

export default DeckForm