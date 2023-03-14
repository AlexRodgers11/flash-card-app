import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from './Modal';
import DeckList from './DeckList';
import { DeckOption, DeckOptionContainer } from './StyledComponents/GroupStyles';
import { addAdminDeck } from '../reducers/decksSlice';
import { submitDeck } from "../reducers/communicationsSlice";
import styled from 'styled-components';
import useToggle from '../hooks/useToggle';
import DeckForm from './DeckForm';

const GroupDecksSectionWrapper = styled.section`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const AddButton = styled.button`
    width: 50%;
    margin: 2rem;
    background-color: #051647;
    border: none;
    @media (max-width: 450px) {
        margin: .75rem;        
        font-size: .75rem;
        padding: .125rem .75rem;
    }
`;

export default function GroupDecksSection() {
    const userId = useSelector((state) => state.login.userId);
    const groupId = useSelector((state) => state.group.groupId);
    const administrators = useSelector((state) => state.group.administrators);
    const userDecks = useSelector((state) => state.login.decks);
    const [showAddModal, toggleShowAddModal] = useToggle(false);
    const [showDeckFormModal, toggleShowDeckFormModal] = useToggle(false);
    const dispatch = useDispatch();

    const chooseDeck = evt => {
        if(administrators?.includes(userId)) {
            dispatch(addAdminDeck({deckId: evt.target.dataset.id, adminId: userId, groupId}))
                .then(() => {
                    toggleShowAddModal();
                });
        } else {
            dispatch(submitDeck({groupId, deckId: evt.target.id}));
            toggleShowAddModal();
        }
    }

    const handleCreateNew = () => {
        toggleShowAddModal();
        toggleShowDeckFormModal();
    }

    return (
        <GroupDecksSectionWrapper>
            <AddButton className="btn btn-primary btn-lg" data-modalcontent="add-deck" onClick={toggleShowAddModal}>{!administrators?.includes(userId) ? 'Submit Deck To Be Added' : 'Add Deck'}</AddButton>
                <DeckList listType="group" listId={groupId} />
                {showAddModal &&
                    <Modal hideModal={toggleShowAddModal}>
                        <DeckOptionContainer>
                            <p>{!administrators?.includes(userId) ? "Submit Deck To Be Added" : "Select a deck to submit"}</p>
                            {userDecks.map(deck => 
                                <DeckOption role="button" data-id={deck._id} key={deck._id} id={deck._id} onClick={chooseDeck}>
                                    {deck.name}
                                </DeckOption>
                            )}
                            <button onClick={handleCreateNew}>Create new deck</button>
                        </DeckOptionContainer>
                    </Modal>
                }
                {showDeckFormModal && 
                    <Modal hideModal={toggleShowDeckFormModal}>
                        <DeckForm />
                    </Modal>
                }
        </GroupDecksSectionWrapper>
    )
}
