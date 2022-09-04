import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { editDeckName, fetchDeck } from '../reducers/deckSlice';
import { useNavigate, useParams } from 'react-router';
import Card from './Card';
import Modal from './Modal';
import useToggle from '../hooks/useToggle';
import axios from 'axios';
import { deleteDeck } from '../reducers/decksSlice';
import CardForm from './CardForm';
import useFormInput from '../hooks/useFormInput';

const baseURL = 'http://localhost:8000';

function Deck() {
    const storedDeckId = useSelector((state) => state.deck.deckId);
    const name = useSelector((state) => state.deck.name);
    const [nameEditMode, toggleNameEditMode] = useToggle(false);
    const [editedName, clearEditedName, handleChangeEditedName, setEditedName] = useFormInput('');
    const publiclyAvailable = useSelector((state) => state.deck.publiclyAvailable);
    const creator = useSelector((state) => state.deck.creator);
    const cards = useSelector((state) => state.deck.cards);
    const permissions = useSelector((state) => state.deck.permissions);
    const [editId, setEditId] = useState("");
    const [editMode, toggleEditMode] = useToggle(false);
    const [deleteInitiated, toggleDeleteInitiated] = useToggle(false);
    
    const { deckId } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const initiateDeleteDeck = () => {
        toggleDeleteInitiated();
    }

    const cancelDeleteDeck = () => {
        toggleDeleteInitiated();
    };

    const confirmDeleteDeck = () => {
        axios.delete(`${baseURL}/decks/${deckId}`)
            .then(() => {
                dispatch(deleteDeck({deckId}));
                navigate("/dashboard");
            })
            .catch(err => {
                console.error(err);
            })
    };

    const handleToggleNameEditMode = () => {
        setEditedName(name);
        toggleNameEditMode();
    }
    
    const openCardEditor = evt => {
        setEditId(evt.target.id);
    }

    const closeCardEditor = () => {
        setEditId("");
    }

    const saveDeckNameChange = evt => {
        axios.put(`${baseURL}/decks/${deckId}`, {name: editedName})
            .then((response) => {
                dispatch(editDeckName({name: response.data.name}));
                clearEditedName();
                toggleNameEditMode();
            })
            .catch(err => console.error(err));
    }

    useEffect(() => {
        if(!storedDeckId || storedDeckId !== deckId) {
            dispatch(fetchDeck(deckId));
        }
    }, [deckId, dispatch, storedDeckId]);
    
    return (
        <div className="Deck" >
            <button onClick={toggleEditMode}>{editMode ? "Done" : "Edit"}</button>
            <button onClick={initiateDeleteDeck}>Delete</button>
            {!deleteInitiated ?
                null
                :
                <div>
                    <button onClick={confirmDeleteDeck}>Yes</button>
                    <button onClick={cancelDeleteDeck}>No</button>
                </div>
            }
            {!nameEditMode ? 
                <h1>{name}<span onClick={handleToggleNameEditMode}> Edit</span></h1> 
                : 
                <div>
                    <input type="text" name="name" id="name" value={editedName} onChange={handleChangeEditedName} />
                    <button type="button" onClick={saveDeckNameChange}>Save</button>
                </div>
            }
            <h3>{creator}</h3>
            <p>Public?: {publiclyAvailable ? "True" : "False"}</p>
            {cards.map(card => <div key={card}><span id={card} onClick={openCardEditor}>E</span><Card cardId={card} /></div>)}
            {!editId ? 
                null
                :
                <Modal hideModal={closeCardEditor}>
                    <CardForm cardId={editId} saveCardChanges={closeCardEditor}/>
                </Modal>
            }
        </div>
    )
}

export default Deck
