import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { fetchStatsDeckIds } from "../reducers/attemptsSlice";
import DeckStatsTile from "./DeckStatsTile";

function DeckStatsList() {
    const deckIds = useSelector((state) => state.attempts.deckIds);
    const dispatch = useDispatch();
    const { userId } = useParams();

    const deckIdsRetrieved = useRef(false);
    useEffect(() => {
        if(!deckIds.length && !deckIdsRetrieved.current) {
            dispatch(fetchStatsDeckIds({userId}));
            deckIdsRetrieved.current = true;
        }
    }, [deckIds, dispatch, userId]);

    return (
        <div>
            {deckIds.map(deckId => <DeckStatsTile deckId={deckId}/>)}   
        </div>
    );
}

export default DeckStatsList;