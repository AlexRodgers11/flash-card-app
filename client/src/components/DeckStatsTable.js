import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllDecksStats } from "../reducers/attemptsSlice";
import { HiOutlineExternalLink } from "react-icons/hi";
import styled from "styled-components";
import { useNavigate } from "react-router";

const DeckStatsTableWrapper = styled.div`
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 9.5rem;
    // pointer-events: auto;
    @media (max-width: 515px) {
        padding-top: 6.5rem;
    }
`;

const DeckStatsTableContainer = styled.div`
    height: calc(100vh - 5.5rem);
    overflow: scroll;
    display: flex;
    display: inline-flex;
    width: 80%;
    flex-direction: column;
    align-items: center;
    // background-color: red;
    &:-webkit-scrollbar {
        display: auto;
    }
`;

const StatsTable = styled.table`
    width: 80%;
    width: 100%;
    border: 2px solid black;
    border-top: none;
    // border-radius: 20%;
    border-collapse: collapse;
    border-spacing: 0;
    background-color: white;
    // pointer-events: auto;
    // scroll-snap-type: y mandatory;
`;

const Header = styled.th.attrs({
    scope: "col"
})`
    border: 1px solid black;
    background-color: #bfbfbf;
    background-color: blue;
    padding: 0 1rem;
`;

const StyledLinkIcon = styled(HiOutlineExternalLink).attrs({
    role: "button"
})`
    height: 1.5rem;
    width: 1.5rem;
`;

const DeckStatsRow = styled.tr`

`;

const DeckStatsCell = styled.td`
    word-wrap: break-word;
    border: 1px solid black;
    padding: .5rem;
`;

const HeaderBlock = styled.thead`
    background-color: black;
    border-top: 2px solid black;
    color: white;
    position: sticky;
    top: 0;
    overflow: auto;
    height: 5rem;
`;

function DeckStatsTable() {
    const decksStats = useSelector((state) => state.attempts.decksStats);
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.login.userId);
    const navigate = useNavigate();
    
    const decksStatsRetrieved = useRef(false);
    useEffect(() => {
        if(!decksStats.length && !decksStatsRetrieved.current) {
            dispatch(fetchAllDecksStats({userId}));
            decksStatsRetrieved.current = true;
        }
    }, [decksStats, dispatch, userId]);

    const handleSelectDeck = (evt) => {
        console.log({path: `/users/${userId}/statistics/sessions/decks/${evt.currentTarget.dataset.deckid}`});
        navigate(`/users/${userId}/statistics/sessions/decks/${evt.currentTarget.dataset.deckid}`);
    }
    
    return (
        <DeckStatsTableWrapper>
            <DeckStatsTableContainer>
                <StatsTable>
                    <HeaderBlock>
                        <tr>
                            <Header>Deck</Header>
                            <Header>Date Last Practiced</Header>
                            <Header>Average Accuracy Rate</Header>
                            <Header>View Attempts</Header>
                        </tr>
                    </HeaderBlock>
                    <tbody>
                        {decksStats.map(deck => (
                            <DeckStatsRow key={deck._id}>
                                <DeckStatsCell>{deck.name}</DeckStatsCell>
                                <DeckStatsCell>{deck.dateLastPracticed || "--"}</DeckStatsCell>
                                <DeckStatsCell>{typeof deck.accuracyRate === "number" ? deck.accuracyRate : "--"}%</DeckStatsCell>
                                <DeckStatsCell><StyledLinkIcon data-deckid={deck._id} onClick={handleSelectDeck}/></DeckStatsCell>
                            </DeckStatsRow>
                        ))}
                        {!decksStats.length && 
                            <DeckStatsRow>
                                <DeckStatsCell>--</DeckStatsCell>
                                <DeckStatsCell>--</DeckStatsCell>
                                <DeckStatsCell>--%</DeckStatsCell>
                                <DeckStatsCell>N/A</DeckStatsCell>
                            </DeckStatsRow>
                        }
                    </tbody>
                </StatsTable>
            </DeckStatsTableContainer>
        </DeckStatsTableWrapper>
    );
}

export default DeckStatsTable;