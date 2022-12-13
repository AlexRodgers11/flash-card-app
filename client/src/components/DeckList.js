import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDecksOfCategory, fetchDecksOfGroup, fetchDecksOfUser, fetchPublicDecks } from '../reducers/decksSlice';
import DeckTile from './DeckTile';

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
        <div>
            {props.listType === listType && deckIds.map(deckId => <DeckTile key={deckId} deckId={deckId} />)}
        </div>
    )
}
