import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { fetchStatsDeckIds } from "../reducers/attemptsSlice";
import DeckStatsTile from "./DeckStatsTile";
import styled from "styled-components";

const DeckStatsListWrapper = styled.div`
    // position: relative;
    // top: 3rem;
    padding-top: 4.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: calc(100vh - 8.5rem);
    @media (max-width: 515px) {
        top: 6rem;
    }
`;

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
        <DeckStatsListWrapper className="DeckStatsListWrapper">
            {deckIds.map(deckId => <DeckStatsTile deckId={deckId}/>)}   
        </DeckStatsListWrapper>
    );
}

export default DeckStatsList;