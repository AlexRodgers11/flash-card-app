import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDecksOfCategory, fetchDecksOfGroup, fetchDecksOfUser, fetchPublicDecks } from '../reducers/decksSlice';
import DeckTile from './DeckTile';
import styled from 'styled-components';

const DeckListWrapper = styled.div`
    min-width: 350px;
    display: grid;
    place-items: center;

    grid-template-columns: repeat(1, 1fr);
    
    @media (min-width: 515px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 740px) {
        grid-template-columns: repeat(3, 1fr);
    }
    
    @media (min-width: 960px) {
        grid-template-columns: repeat(4, 1fr);
    }
    
    
    @media (min-width: 1310px) {
        grid-template-columns: repeat(5, 1fr)
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

    useEffect(() => {
        if(listType !== props.listType && listId !== props.listId) {
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
                case "all":
                    dispatch(fetchPublicDecks({searchString: "", categoryId: "", sort: ""}));
                    break;
                default:
                    break;
            }
        }
    }, [deckIds, dispatch, listId, listType, props.listId, props.listType]);

    return (
        <DeckListWrapper className="DeckListWrapper">
            {props.listType === listType && deckIds.map(deckId => <DeckTile key={deckId} deckId={deckId} />)}
        </DeckListWrapper>
    )
}
