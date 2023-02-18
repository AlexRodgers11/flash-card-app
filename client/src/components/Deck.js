import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { addCard, updateDeck, fetchDeck, resetDeck } from '../reducers/deckSlice';
import { deleteDeck } from '../reducers/decksSlice';
import useToggle from '../hooks/useToggle';
import Card from './Card';
import CardForm from './CardForm';
import Modal from './Modal';
import { removeDeckFromUser } from '../reducers/loginSlice';
import { MdModeEditOutline } from "react-icons/md";
import styled from 'styled-components';

const DeckWrapper = styled.div`
    min-height: calc(100vh - 5.5rem);
    background-color: #52B2FF; 
`;
    
const NameBlock = styled.div`
    display: flex;
    justify-content: center;
    color: white;
    padding-top: 1rem;
    & h1 {
        font-size: 3.5rem;
        @media (max-width: 450px) {
            font-size: 2rem;
        }
    }
`;

const StyledEditIcon = styled(MdModeEditOutline)`
    cursor: pointer;
`;

const CardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const AddButton = styled.button`
    margin: 2rem;
    // background-color: #00437A;
    // background-color: #9DE59D;
    // background-color: #FFD549;
    background-color: #051647;
    // color: black;
    @media (max-width: 450px) {
        margin: .75rem;        
        font-size: .75rem;
        padding: .125rem .75rem;
    }
`;

const PublicControls = styled.div`
    margin-top: .5rem;
    color: white;
    font-size: 1.25rem;
    & label {
        margin-right: .15rem;
    }
    & input:first-of-type {
        margin-right: .5rem;
    }
    @media (max-width: 450px) {
        font-size: .625rem;
        margin-top: .25rem;
        
    }
`;

function Deck() {
    const storedDeckId = useSelector((state) => state.deck.deckId);
    const name = useSelector((state) => state.deck.name);
    const [nameEditMode, toggleNameEditMode] = useToggle(false);
    const [editedName, clearEditedName, handleChangeEditedName, setEditedName] = useFormInput('');
    const publiclyAvailable = useSelector((state) => state.deck.publiclyAvailable);
    const cards = useSelector((state) => state.deck.cards);
    const groupDeckBelongsTo = useSelector((state) => state.deck.groupDeckBelongsTo);
    const [editMode, toggleEditMode] = useToggle(false);
    const [modalContent, setModalContent] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const displayModalContent = () => {
        switch(modalContent) {
            case "add-card":
                return <CardForm submit={handleAddCard} />
            case "delete-deck-confirmation":
                return (
                    <div>
                        <h3>Are you sure you want to delete this deck? This action cannot be undone.</h3>
                        <button onClick={hideModal}>Cancel</button>
                        <button onClick={confirmDeleteDeck}>Delete</button>
                    </div>
                );
            default:
                return;
        }
    }
    
    const { deckId } = useParams();

    const confirmDeleteDeck = () => {
        navigate("/dashboard");
        dispatch(deleteDeck(deckId))
            .then(() => {
                dispatch(resetDeck());
                dispatch(removeDeckFromUser({deckId}));
            });
    };

    const handleSelectModalContent = (evt) =>  {
        setModalContent(evt.target.dataset.action);
    }

    const handleAddCard = (newCard) => {
        if(groupDeckBelongsTo) {
            newCard.groupCardBelongsTo = groupDeckBelongsTo;
        }
        dispatch(addCard({newCard, deckId}));
        hideModal();
    }

    const hideModal = () => {
        setModalContent("");
    }
    
    const handleChangePubliclyAvailable = evt => {
        dispatch(updateDeck({deckId, deckUpdates: {publiclyAvailable: !publiclyAvailable}}));
    }
    
    const openNameEditMode = () => {
        setEditedName(name);
        toggleNameEditMode();
    }

    const saveDeckNameChange = evt => {
        evt.preventDefault();
        if(editedName !== name) {
            //use cookie here
            dispatch(updateDeck({deckId, deckUpdates: {name: editedName}}));
        }
        clearEditedName();
        toggleNameEditMode();
    }

    useEffect(() => {
        if(!storedDeckId || storedDeckId !== deckId) {
            dispatch(fetchDeck(deckId));
        }
    }, [deckId, dispatch, storedDeckId]);
    
    return (
        <DeckWrapper>
            {/* <button onClick={toggleEditMode}>{editMode ? "Done" : "Edit"}</button> */}
            {editMode && <button data-action="delete-deck-confirmation" onClick={handleSelectModalContent}>Delete</button>}
            {!nameEditMode ? 
                <NameBlock>
                    <h1>{name}</h1> 
                    <StyledEditIcon role="button" onClick={openNameEditMode} />
                </NameBlock>
                : 
                <form onSubmit={saveDeckNameChange}>
                    <input type="text" name="name" id="name" value={editedName} onChange={handleChangeEditedName} />
                    <button type="submit">Save</button>
                </form>
            }
            <PublicControls>
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
            </PublicControls>
            <AddButton className="btn btn-primary btn-lg" data-action="add-card" onClick={handleSelectModalContent}>Add Card</AddButton>
            <CardContainer className="CardContainer">
                {cards.map(card => <Card cardId={card} />
                )}

                {modalContent && 
                    <Modal hideModal={hideModal}>
                        {displayModalContent()}
                    </Modal>
                }
            </CardContainer>
        </DeckWrapper>
    )
}

export default Deck
