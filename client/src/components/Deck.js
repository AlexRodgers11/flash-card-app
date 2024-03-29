import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router";
import useFormInput from "../hooks/useFormInput";
import { addCard, updateDeck, fetchDeck, resetDeck } from "../reducers/deckSlice";
import { deleteDeck } from "../reducers/decksSlice";
import useToggle from "../hooks/useToggle";
import Card from "./Card";
import CardForm from "./CardForm";
import Modal from "./Modal";
import { removeDeckFromUser } from "../reducers/loginSlice";
import { MdModeEditOutline } from "react-icons/md";
import styled from "styled-components";
import { EmptyIndicator } from "./StyledComponents/EmptyIndicator";
import BackButton from "./BackButton";
import { submitCardForApproval } from "../reducers/communicationsSlice";
import { WarningButtonsWrapper, WarningMessage } from "./StyledComponents/Warning";
import { fetchCategories } from "../reducers/decksSlice";

const DeckWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: calc(100vh - 5.5rem);
    background-color: #52B2FF; 
    padding-bottom: 3rem;
    
`;

const SelectContainer = styled.div`
    text-align: left;
    & label {
        color: white;
    }
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
    const deckListType = useSelector((state) => state.decks.listType);
    const userDecks = useSelector((state) => state.login.decks);
    const name = useSelector((state) => state.deck.name);
    const [nameEditMode, toggleNameEditMode] = useToggle(false);
    const administrators = useSelector((state) => state.group.administrators)
    const category = useSelector((state) => state.deck.category);
    const categories = useSelector((state) => state.decks.categories);
    const [editedName, clearEditedName, handleChangeEditedName, setEditedName] = useFormInput("");
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
                return <CardForm buttonText={unlockControl() ? "Add Card" : "Submit Card for Approval"} submit={unlockControl() ? handleAddCard : handleSubmitCardForApproval} />
            case "delete-deck-confirmation":
                return (
                    <div>
                        <WarningMessage>Are you sure you want to delete this deck? This action cannot be undone.</WarningMessage>
                        <WarningButtonsWrapper>
                            <button className="btn btn-secondary" onClick={hideModal}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmDeleteDeck}>Delete</button>
                        </WarningButtonsWrapper>
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
        dispatch(addCard({newCard, deckId}));
        hideModal();
    }

    const handleSubmitCardForApproval = (newCard) => {
        dispatch(submitCardForApproval({newCard, groupId: groupDeckBelongsTo, deckId}));
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

    const handleCategorySelectionChange = evt => {
        dispatch(updateDeck({deckId, deckUpdates: {category: evt.target.value}}));
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
        if((!storedDeckId || storedDeckId !== deckId) || categories.length < 1) {
            dispatch(fetchDeck(deckId)); 
            dispatch(fetchCategories());
        }
    }, [categories, deckId, dispatch, storedDeckId]);

    if(storedDeckId !== deckId || categories.length < 1) {
        return <DeckWrapper></DeckWrapper>
    } 
    return (
        <DeckWrapper>
            <BackButton route={-1}>{deckListType === "user" ? "My Decks" : "Browse Decks"}</BackButton>
            {unlockControl() && <DeleteButton className="btn btn-danger" data-action="delete-deck-confirmation" onClick={handleSelectModalContent}>Delete Deck</DeleteButton>}
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
            {unlockControl() &&
                <>
                <PublicControls>
                    <label htmlFor="public">Public</label>
                    <input 
                        type="radio"
                        id="public"
                        name="publicly-available"
                        value="true"
                        checked={publiclyAvailable}
                        onChange={handleChangePubliclyAvailable}
                    />
                    <label htmlFor="private">Private</label>
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
                </>
            }
            {unlockControl() && 
                <SelectContainer>
                    <label className="form-check-label">Category</label>
                    <select className="form-select" name="categories" id="categories" onChange={handleCategorySelectionChange} value={category}>
                        <option value="" default></option>
                        {categories.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}
                    </select>
                </SelectContainer>
            }
            <AddButton className="btn btn-primary btn-lg" data-action="add-card" onClick={handleSelectModalContent}>Add Card</AddButton>
            <CardContainer className="CardContainer">
                {!cards.length && <EmptyIndicator>No cards have been created yet</EmptyIndicator>}
                {cards.map(card => <Card cardId={card} allowedToEdit={true} />
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
