import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import useFormInput from '../hooks/useFormInput';
import { addCard, deleteCard, updateDeck, fetchDeck, resetDeck } from '../reducers/deckSlice';
import { deleteDeck } from '../reducers/decksSlice';
import useToggle from '../hooks/useToggle';
import Card from './Card';
import CardForm from './CardForm';
import Modal from './Modal';

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
    const [editMode, toggleEditMode] = useToggle(false);
    
    const { deckId } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [modalContent, setModalContent] = useState("");
    const [selectedCardId, setSelectedCardId] = useState("");
    
    const displayModalContent = () => {
        switch(modalContent) {
            case "edit-card":
                return <CardForm cardId={selectedCardId} submit={handleSaveCardChanges}/>
            case "add-card":
                return <CardForm submit={handleAddCard} />
            case "delete-card":
                return (
                    <div>
                        <h3>Are you sure you want to delete this card? This action cannot be undone.</h3>
                        <button onClick={() => setModalContent("")}>Cancel</button><button onClick={confirmDeleteCard}>Delete</button>
                    </div>
                );
            case "delete-deck-confirmation":
                return (
                    <div>
                        <h3>Are you sure you want to delete this deck? This action cannot be undone.</h3>
                        <button onClick={hideModal}>Cancel</button>
                        <button onClick={confirmDeleteDeck}>Delete</button>
                    </div>
                );
            case "view-card":
                return <Card cardId={selectedCardId} displayMode={true}/>
            default:
                return;
        }
    }

    const handleSelectModalContent = (evt) =>  {
        setModalContent(evt.target.dataset.action);
        if(evt.target.dataset.card_id) {
            setSelectedCardId(evt.target.dataset.card_id);
        }
    }

    const confirmDeleteDeck = () => {
        dispatch(deleteDeck(deckId))
            .then(() => {
                navigate("/dashboard");
                dispatch(resetDeck());
            });
    };

    const confirmDeleteCard = () => {
        dispatch(deleteCard({cardToDeleteId: selectedCardId}));
        hideModal();
    }

    const handleAddCard = (newCard) => {
        dispatch(addCard({newCard, deckId}));
        hideModal();
    }

    const hideModal = () => {
        setModalContent("");
        if(selectedCardId) {
            setSelectedCardId("");
        }
    }

    //worth putting in a reducer? Store state remains unchanged b/c the id stays the same. Really just need to update database and rerender
    const handleSaveCardChanges = (editedCard) => {
        axios.put(`${baseURL}/cards/${selectedCardId}`, editedCard)
			.then(response => {
                hideModal();
            })
			.catch(err => console.error(err));
    }
    
    const handleChangePubliclyAvailable = evt => {
        dispatch(updateDeck({deckId, deckUpdates: {publiclyAvailable: !publiclyAvailable}}));
    }
    
    const handleToggleNameEditMode = () => {
        setEditedName(name);
        toggleNameEditMode();
    }

    const saveDeckNameChange = evt => {
        dispatch(updateDeck({deckId, deckUpdates: {name: editedName}}));
        clearEditedName();
        toggleNameEditMode();
    }

    useEffect(() => {
        if(!storedDeckId || storedDeckId !== deckId) {
            dispatch(fetchDeck(deckId));
        }
    }, [deckId, dispatch, storedDeckId]);
    
    return (
        <div className="Deck" >
            <button onClick={toggleEditMode}>{editMode ? "Done" : "Edit"}</button>
            {editMode && <button data-action="delete-deck-confirmation" onClick={handleSelectModalContent}>Delete</button>}
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
            <button data-action="add-card" onClick={handleSelectModalContent}>Add Card</button>
            {cards.map(card => 
                (<div key={card}>
                    {!editMode ? 
                        null
                        :
                        <div>
                            <span data-card_id={card} data-action="edit-card" onClick={handleSelectModalContent}>Edit </span>
                            <span data-card_id={card} data-action="delete-card" onClick={handleSelectModalContent}>Delete </span>
                        </div>
                    }
                    <div>
                        <span data-card_id={card} data-action="view-card" onClick={handleSelectModalContent}>View </span>
                        <Card cardId={card} />
                    </div>
                </div>))}
            {modalContent && 
                <Modal hideModal={hideModal}>
                    {displayModalContent()}
                </Modal>
            }
        </div>
    )
}

export default Deck
