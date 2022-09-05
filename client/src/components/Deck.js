import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addCard, deleteCard, editDeckName, editPubliclyAvailable, fetchDeck } from '../reducers/deckSlice';
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
    const [editId, setEditId] = useState('');
    const [deleteId, setDeleteId] = useState('');
    const [addMode, toggleAddMode] = useToggle(false);
    const [editMode, toggleEditMode] = useToggle(false);
    const [deleteDeckInitiated, toggleDeleteDeckInitiated] = useToggle(false);
    
    const { deckId } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const initiateDeleteDeck = () => {
        toggleDeleteDeckInitiated();
    }

    const cancelDeleteDeck = () => {
        toggleDeleteDeckInitiated();
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

    const initiateDeleteCard = (evt) => {
        setDeleteId(evt.target.dataset.cardid);
    }

    const cancelDeleteCard = () => {
        setDeleteId('');
    }

    const confirmDeleteCard = () => {
        axios.delete(`${baseURL}/cards/${deleteId}`)
            .then(() => {
                dispatch(deleteCard({cardId: deleteId}));
                setDeleteId('');
            })
            .catch(err => console.error(err));
    }

    const handleAddCard = (newCard) => {
        axios.post(`${baseURL}/decks/${deckId}/cards`, newCard)
            .then((response) => {
                dispatch(addCard({cardId: response.data._id}));
                toggleAddMode();
            })
            .catch(err => console.error(err));
    }

    const handleSaveCardChanges = (editedCard) => {
        axios.put(`${baseURL}/cards/${editId}`, editedCard)
			.then(response => {
                setEditId('');
            })
			.catch(err => console.error(err));
    }
    
    const handleChangePubliclyAvailable = evt => {
        let editedPubliclyAvailable = evt.target.value === "true";
        axios.put(`${baseURL}/decks/${deckId}`, {public: editedPubliclyAvailable})
            .then((response) => {
                console.log(response.data);
                dispatch(editPubliclyAvailable({publiclyAvailable: response.data.public}));
            })
            .catch(err => console.error(err));
    }
    
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
            {!deleteDeckInitiated ?
                null
                :
                <Modal hideModal={cancelDeleteDeck}>
                    <div>
                        <h3>Are you sure you want to delete this deck? This action cannot be undone.</h3>
                        <button onClick={cancelDeleteDeck}>Cancel</button>
                        <button onClick={confirmDeleteDeck}>Delete</button>
                    </div>
                </Modal>
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
            <div>
                <label htmlFor='public'>Public</label>
                <input 
                    type="radio"
                    id="public"
                    name="publicly-available"
                    value="true"
                    checked={publiclyAvailable}
                    onChange={handleChangePubliclyAvailable}
                />
                <label htmlFor='private'>Private</label>
                <input 
                    type="radio"
                    id="private"
                    name="publicly-available"
                    value="false"
                    checked={!publiclyAvailable}
                    onChange={handleChangePubliclyAvailable}
                />
            </div>
            <h2>Cards</h2>
            <button onClick={toggleAddMode}>Add Card</button>
            {cards.map(card => <div key={card}><span id={card} onClick={openCardEditor}>E</span><span data-cardid={card} onClick={initiateDeleteCard}>D</span><Card cardId={card} /></div>)}
            {!editId ? 
                null
                :
                <Modal hideModal={closeCardEditor}>
                    <CardForm cardId={editId}  submit={handleSaveCardChanges}/>
                </Modal>
            }
            {!addMode ?
                null
                :
                <Modal hideModal={toggleAddMode}>
                    <CardForm submit={handleAddCard} />
                </Modal>
            }
            {!deleteId ? 
                null
                :
                <Modal hideModal={cancelDeleteCard}>
                    <div>
                        <h3>Are you sure you want to delete this card? This action cannot be undone.</h3>
                        <button onClick={cancelDeleteCard}>Cancel</button><button onClick={confirmDeleteCard}>Delete</button>
                    </div>
                    
                </Modal>
            }
        </div>
    )
}

export default Deck
