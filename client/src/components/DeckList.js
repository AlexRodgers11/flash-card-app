import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDecksOfCategory, fetchDecksOfGroup, fetchDecksOfUser } from '../reducers/decksSlice';
import DeckThumbnail from './DeckThumbnail';

export default function DeckList(props) {
    const dispatch = useDispatch();
    const deckIds = useSelector((state) => state.decks.deckIds);
    const listType = useSelector((state) => state.decks.listType);
    const listId = useSelector((state) => state.decks.listId);

    useEffect(() => {
        console.log("use effect running");
        if(!listType && !listId) {
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

    return (
        <div>
            Decks:
            {deckIds.map(deckId => <DeckThumbnail key={deckId} deckId={deckId} />)}
        </div>
    )
}
