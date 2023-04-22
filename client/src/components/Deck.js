import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router';
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
import { EmptyIndicator } from './StyledComponents/EmptyIndicator';
import BackButton from './BackButton';

const DeckWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: calc(100vh - 5.5rem);
    background-color: #52B2FF; 
`;
    
const NameBlock = styled.div`
    display: flex;
    justify-content: center;
    color: white;
    padding-top: 1.5rem;
    &.name-only {
        margin-bottom: 2rem;
    }
    & h1 {
        font-size: 3.5rem;
        @media (max-width: 750px) {
            font-size: 2.75rem;
        }
        @media (max-width: 450px) {
            font-size: 1.5rem;
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
    width: 100%;
`;

const AddButton = styled.button`
    width: 50%;
    margin: 2rem;
    border: none;
    background-color: #051647;
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

export const DeleteButton = styled.button`
    display: inline-flex;
    align-self: end;
    position: relative;
    top: 1rem;
    right: 1rem;
    background-color: black;
    color: white;
    @media (max-width: 750px) {
        font-size: .8rem;
    }
    @media (max-width: 450px) {
        font-size: .71rem;
    }
`;

function Deck() {
    const userId = useSelector((state) => state.login.userId);
    const storedDeckId = useSelector((state) => state.deck.deckId);
    const userDecks = useSelector((state) => state.login.decks);
    const name = useSelector((state) => state.deck.name);
    const [nameEditMode, toggleNameEditMode] = useToggle(false);
    const administrators = useSelector((state) => state.group.administrators)
    const [editedName, clearEditedName, handleChangeEditedName, setEditedName] = useFormInput('');
    const publiclyAvailable = useSelector((state) => state.deck.publiclyAvailable);
    const allowCopies = useSelector((state) => state.deck.allowCopies);
    const cards = useSelector((state) => state.deck.cards);
    const groupDeckBelongsTo = useSelector((state) => state.deck.groupDeckBelongsTo);
    const [modalContent, setModalContent] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { deckId } = useParams();
    const location = useLocation();

    const unlockControl = () => {
        if(location.pathname.includes("group")) {
            return administrators.includes(userId);
        } else {
            return userDecks.map(deck => deck._id).includes(deckId);
        }
    }
    
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

    const handleChangeAllowCopies = evt => {
        dispatch(updateDeck({deckId, deckUpdates: {allowCopies: !allowCopies}}));
    }
    
    const openNameEditMode = () => {
        setEditedName(name);
        toggleNameEditMode();
    }

    const saveDeckNameChange = evt => {
        evt.preventDefault();
        if(editedName !== name) {
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

    if(storedDeckId !== deckId) {
        return <></>;
    } else if(unlockControl()) {
        return (
            <DeckWrapper>
                <BackButton route={location.pathname.slice(0, location.pathname.lastIndexOf("/"))}>All Decks</BackButton>
                <DeleteButton data-action="delete-deck-confirmation" onClick={handleSelectModalContent}>Delete Deck</DeleteButton>
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
                {publiclyAvailable &&
                    <PublicControls>
                        <label htmlFor="allow-copies">Allow Copies</label>
                        <input 
                            type="radio"
                            id="allow-copies"
                            name="copies-allowed"
                            value="true"
                            checked={allowCopies}
                            onChange={handleChangeAllowCopies}
                        />
                        <label htmlFor="prohibit-copies">Prohibit Copies</label>
                        <input 
                            type="radio"
                            id="prohibit-copies"
                            name="copies-allowed"
                            value="false"
                            checked={!allowCopies}
                            onChange={handleChangeAllowCopies}
                        />
                    </PublicControls>
                }
                <AddButton className="btn btn-primary btn-lg" data-action="add-card" onClick={handleSelectModalContent}>Add Card</AddButton>
                <CardContainer className="CardContainer">
                    {!cards.length && <EmptyIndicator>No cards have been created yet</EmptyIndicator>}
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
    } else {
        return (
            <DeckWrapper>
                <BackButton route={location.pathname.slice(0, location.pathname.lastIndexOf("/"))}>All Decks</BackButton>
                <NameBlock className="name-only">
                    <h1>{name}</h1>
                </NameBlock>
                <CardContainer className="CardContainer">
                    {!cards.length && <EmptyIndicator>No cards have been created yet</EmptyIndicator>}
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
    
}

export default Deck
