import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchCardStatsByDeck } from "../reducers/attemptsSlice";
import styled from "styled-components";
import { HiOutlineExternalLink } from "react-icons/hi";

const CardStatsTableWrapper = styled.div`
    width: 100vw;
    padding-top: 4.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 9.5rem;
    // pointer-events: auto;
    @media (max-width: 515px) {
        padding-top: 6.5rem;
    }
    @media (max-width: 650px) {
        font-size: .8rem;
    }
    @media (max-width: 550px) {
        font-size: .7rem;
    }
`;

const CardStatsTableContainer = styled.div`
    height: calc(100vh - 5.5rem);
    overflow: scroll;
    display: flex;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    &:-webkit-scrollbar {
        display: auto;
    }
    width: 80%;
    @media (max-width: 650px) {
        width: 85%;
    }
    @media (max-width: 550px) {
        width: 95%;
    }
`;

const StatsTable = styled.table`
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
    
const ColumnHeaderBlock = styled.thead`
    // background-color: black;
    border-top: 2px solid black;
    color: white;
    position: sticky;
    top: 0;
    overflow: auto;
    height: 5rem;
    @media (max-width: 650px) {
        height: 4rem;
    }
    @media (max-width: 550px) {
        height: 3rem;
    }
`;

const ColumnHeader = styled.th.attrs({
    scope: "col",
    className: "ColumnHeader"
})`
    border: 1px solid black;
    background-color: #bfbfbf;
    background-color: blue;
    background-color: #393939;
    padding: 0 1rem;
    @media (max-width: 550px) {
        padding: 0 .25rem;
    }
`;
    
const DeckHeaderBlock = styled.thead`
    background-color: black;
    color: white;
    position: sticky;
    top: calc(5rem - 2px);
    @media (max-width: 650px) {
        top: calc(4rem - 2px);
    }
    @media (max-width: 550px) {
        top: calc(3rem - 2px);
    }
    // overflow: auto;
    word-wrap: anywhere;
`;

const DeckHeader = styled.th.attrs({
    colSpan: 5
})`
    padding: 0rem;
    width: 100%;
    height: 2rem;
    word-wrap: anywhere;
`

const TableRow = styled.tr.attrs({
    scope: "row"
})`
    width: 100%;
    // scroll-snap-align: center;
`;

const TableCell = styled.td`
    word-wrap: break-word;
    border: 1px solid black;
    padding: .5rem;
    @media (max-width: 650px) {
        padding: .25rem;
    }
    @media (max-width: 550px) {
        padding: .1rem;
    }
    word-wrap: anywhere;
`;

const RowHeader = styled.th`
    overflow-wrap: anywhere;
    border: 1px solid black;
    padding: .5rem;
    text-align: left;
`;

const StyledLinkIcon = styled(HiOutlineExternalLink).attrs({
    role: "button"
})`
    height: 1.5rem;
    width: 1.5rem;
    @media (max-width: 650px) {
        height: 1.25rem;
        width: 1.25rem;
    }
    &:hover {
        color: #5e5e5e;
    }
`;

const TableBody = styled.tbody`

`;

function CardStatsTable() {
    const cardStatsByDeck = useSelector((state) => state.attempts.cardStatsByDeck);
    const userId = useSelector((state) => state.login.userId);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSelectCard = (evt) => {
        navigate(`/users/${userId}/statistics/cards/${evt.currentTarget.dataset.cardid}`);
    } 

    const cardsRetrieved = useRef(false)
    useEffect(() => {
        if(!cardStatsByDeck.length && !cardsRetrieved.current) {
            console.log("condition met")
            dispatch(fetchCardStatsByDeck({userId}));
            cardsRetrieved.current = true;
        }
    }, [cardStatsByDeck, dispatch, userId]);
    

    return (
        <CardStatsTableWrapper className="CardStatsTableWrapper">
            <CardStatsTableContainer className="CardStatsTableContainer">
                <StatsTable className="CardStatsTable">
                    <ColumnHeaderBlock className="ColumnHeaderBlock">
                        <ColumnHeader>Question</ColumnHeader>
                        <ColumnHeader>Accuracy Rate</ColumnHeader>
                        <ColumnHeader>Date Last Practiced</ColumnHeader>
                        <ColumnHeader>Times Practiced</ColumnHeader>
                        <ColumnHeader>View Previous Card Attempts</ColumnHeader>
                    </ColumnHeaderBlock>
                    {cardStatsByDeck.map((deck, index) => {
                        if(deck.cards.length) {
                            return (
                                <>
                                    <DeckHeaderBlock className="DeckHeaderBlock">
                                        <tr>
                                            <DeckHeader className="DeckHeader" scope="row">Deck: {deck.name}</DeckHeader>
                                        </tr>
                                    </DeckHeaderBlock>  
                                    
                                    <TableBody>
                                        {deck.cards.map(card => 
                                            (<TableRow key={card._id} className="TableRow">
                                                <RowHeader className="RowHeader">{card.cardQuestion}</RowHeader>
                                                <TableCell className="TableCell">{typeof card.accuracyRate === "number" ? card.accuracyRate : "--"}%</TableCell>
                                                <TableCell className="TableCell">{card.dateLastPracticed || "--"}</TableCell>
                                                <TableCell className="TableCell">{card.attemptCount || 0}</TableCell>
                                                <TableCell className="TableCell"><StyledLinkIcon data-cardid={card._id} onClick={handleSelectCard}/></TableCell>
                                            </TableRow>)
                                        )}
                                    </TableBody> 
                                </>
                            );
                        } else {
                            return <></>
                        }
                    })}
                    {!cardStatsByDeck.map((deck) => deck.cards).flat().length && 
                        <TableRow className="TableRow">
                            <TableCell className="RowHeader">--</TableCell>
                            <TableCell className="TableCell">--%</TableCell>
                            <TableCell className="TableCell">--</TableCell>
                            <TableCell className="TableCell">--</TableCell>
                            <TableCell className="TableCell">N/A</TableCell>
                        </TableRow>
                    }
                </StatsTable>
            </CardStatsTableContainer>
            {!cardStatsByDeck.map(deck => deck.cards).flat().length && (
                <TableRow className="TableRow">
                <RowHeader className="RowHeader">--</RowHeader>
                <TableCell className="TableCell">--%</TableCell>
                <TableCell className="TableCell">--</TableCell>
                <TableCell className="TableCell">--</TableCell>
                <TableCell className="TableCell">N/A</TableCell>
            </TableRow>
            )}
        </CardStatsTableWrapper>
    );
}

export default CardStatsTable;