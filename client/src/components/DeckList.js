import React, { useState } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDecksOfCategory, fetchDecksOfGroup, fetchDecksOfUser } from '../reducers/decksSlice';
import DeckTile from './DeckTile';
import Modal from './Modal';
import SessionSetupForm from './SessionSetupForm';
import styled from 'styled-components';
import { EmptyIndicator } from './StyledComponents/EmptyIndicator';
import { useNavigate } from 'react-router';
import { resetSessionSetupFormData, setDeckIdInSetup } from '../reducers/practiceSessionSlice';

const DeckListWrapper = styled.div`
    min-width: 350px;
    display: grid;
    place-items: center;
    position: relative;
    border-top: 2px solid black;
    grid-template-columns: repeat(4, 1fr);

    @media (min-width: 795px) {
        grid-template-columns: repeat(5, 1fr);
    }

    @media (min-width: 1600px) {
        grid-template-columns: repeat(6, 1fr);
    }
`

export default function DeckList(props) {
    const dispatch = useDispatch();
    const deckIds = useSelector((state) => state.decks.deckIds);
    const listType = useSelector((state) => state.decks.listType);
    const listId = useSelector((state) => state.decks.listId);
    const deckInSetup = useSelector((state) => state.practiceSession.deckIdInSetup);

    const handleCloseSessionSetupForm = () => {
        dispatch(resetSessionSetupFormData());
    }

    useEffect(() => {
        if(listType !== props.listType || listId !== props.listId) {
            switch(props.listType) {
                case "category":
                    dispatch(fetchDecksOfCategory(props.listId));
                    break;
                case "group":
                    dispatch(fetchDecksOfGroup(props.listId));
                    break;
                case "user":
                    dispatch(fetchDecksOfUser(props.listId));
                    break;
                default:
                    break;
            }
        }
    }, [deckIds, dispatch, listId, listType, props.listId, props.listType]);

    if(props.listType !== listType || props.listId !== listId) { //why does this conditional not keep DeckList from rendering before useEffect is done aligning the lists?
        return <></>
    } 
    
    if(!deckIds.length) {
        return (
            <EmptyIndicator>No decks created yet</EmptyIndicator>
        );
    }
    return (
        <DeckListWrapper className="DeckListWrapper">
            {deckIds.map(deckId => <DeckTile key={deckId} deckId={deckId} />)}
            {deckInSetup && 
                <Modal hideModal={handleCloseSessionSetupForm}>
                    <SessionSetupForm />
                </Modal>
            }
        </DeckListWrapper>
    )
}
