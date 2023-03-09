import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { fetchCardStatsByDeck } from "../reducers/attemptsSlice";
import CardStatsTile from "./CardStatsTile";
import styled from "styled-components";
import { EmptyIndicator } from "./StyledComponents/EmptyIndicator";

const CardStatsListWrapper = styled.div`
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
`;

const CardStatsTableContainer = styled.div`
    height: calc(100vh - 5.5rem);
    overflow: scroll;
    display: flex;
    display: inline-flex;
    width: 80%;
    flex-direction: column;
    align-items: center;
    background-color: red;
    &:-webkit-scrollbar {
        display: auto;
    }
`;

const CardStatsTable = styled.table`
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
    
const QuestionHeaderBlock = styled.thead`
    background-color: black;
    border-top: 2px solid black;
    color: white;
    position: sticky;
    top: 0;
    overflow: auto;
    height: 5rem;
`;

const QuestionHeader = styled.th.attrs({
    scope: "col"
})`
    border: 1px solid black;
    background-color: #bfbfbf;
    background-color: blue;
    padding: 0 1rem;
`;
    
const DeckHeaderBlock = styled.thead`
    background-color: black;
    color: white;
    position: sticky;
    top: calc(5rem - 2px);
    overflow: auto;
`;

const DeckHeader = styled.th.attrs({
    colSpan: 4
})`
    padding: 0rem;
    width: 100%;
    height: 2rem;
`




function CardStatsList() {
    const cardStatsByDeck = useSelector((state) => state.attempts.cardStatsByDeck);
    const { userId } = useParams();
    const dispatch = useDispatch();

    const cardsRetrieved = useRef(false)
    useEffect(() => {
        if(!cardStatsByDeck.length && !cardsRetrieved.current) {
            console.log("condition met")
            dispatch(fetchCardStatsByDeck({userId}));
            cardsRetrieved.current = true;
        }
    }, [cardStatsByDeck, dispatch, userId]);
    

    return (
        <CardStatsListWrapper className="CardStatsListWrapper">
            <CardStatsTableContainer className="CardStatsTableContainer">
                <CardStatsTable className="CardStatsTable">
                    <QuestionHeaderBlock className="QuestionHeaderBlock">
                        <QuestionHeader>Question</QuestionHeader>
                        <QuestionHeader>Accuracy Rate</QuestionHeader>
                        <QuestionHeader>Date Last Practiced</QuestionHeader>
                        <QuestionHeader>Times Practiced</QuestionHeader>
                    </QuestionHeaderBlock>
                    {cardStatsByDeck.map((deck, index) => {
                        if(deck.cards.length) {
                            return (
                                <>
                                    <DeckHeaderBlock className="DeckHeaderBlock">
                                        <tr>
                                            <DeckHeader className="DeckHeader" scope="row">Deck: {deck.name}</DeckHeader>
                                        </tr>
                                    </DeckHeaderBlock>  
                                    
                                    <tbody>
                                        {deck.cards.map(cardId => <CardStatsTile key={cardId} cardId={cardId} />)}
                                    </tbody> 
                                </>
                            );
                        } else {
                            return <></>
                        }
                    })}
                </CardStatsTable>
            </CardStatsTableContainer>
            {!cardStatsByDeck.map(deck => deck.cards).flat().length && <EmptyIndicator marginTop={3}>No cards have been practiced yet</EmptyIndicator>}
        </CardStatsListWrapper>
    );
}

export default CardStatsList;





































































// import { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams } from "react-router";
// import { fetchCardStatsByDeck } from "../reducers/attemptsSlice";
// import CardStatsTile from "./CardStatsTile";
// import styled from "styled-components";
// import { EmptyIndicator } from "./StyledComponents/EmptyIndicator";

// const CardStatsListWrapper = styled.div`
//     width: 100vw;
//     padding-top: 4.5rem;
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     // position: fixed;
//     // top: 9.5rem;
//     padding-bottom: 4.5rem;
//     @media (max-width: 515px) {
//         padding-top: 6.5rem;
//     }
// `;

// const CardStatsTable = styled.table`
//     width: 80%;
//     border: 2px solid black;
//     border-top: none;
//     // border-radius: 20%;
//     border-collapse: collapse;
//     border-spacing: 0;
//     background-color: white;
//     // margin-bottom: 2rem;
//     // margin-bottom: 16rem;
//     // overflow: scroll;
//     // position: sticky;
//     // top: 25rem;
// `;
    
// const QuestionHeaderBlock = styled.thead`
//     background-color: black;
//     border-top: 2px solid black;
//     color: white;
//     position: sticky;
//     top: 0;
//     overflow: auto;
//     height: 5rem;
// `;

// const QuestionHeader = styled.th.attrs({
//     scope: "col"
// })`
//     border: 1px solid black;
//     background-color: #bfbfbf;
//     background-color: blue;
//     padding: 0 1rem;
// `;
    
// const DeckHeaderBlock = styled.thead`
//     background-color: black;
//     color: white;
//     position: sticky;
//     top: calc(5rem - 2px);
//     overflow: auto;
// `;

// const DeckHeader = styled.th.attrs({
//     colSpan: 4
// })`
//     padding: 0rem;
//     width: 100%;
//     height: 2rem;
// `


// const CardStatsTableContainer = styled.div`
//     height: calc(100vh - 5.5rem);
//     overflow: scroll;
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     background-color: red;
// `;


// function CardStatsList() {
//     const cardStatsByDeck = useSelector((state) => state.attempts.cardStatsByDeck);
//     const { userId } = useParams();
//     const dispatch = useDispatch();

//     const cardsRetrieved = useRef(false)
//     useEffect(() => {
//         if(!cardStatsByDeck.length && !cardsRetrieved.current) {
//             console.log("condition met")
//             dispatch(fetchCardStatsByDeck({userId}));
//             cardsRetrieved.current = true;
//         }
//     }, [cardStatsByDeck, dispatch, userId]);
    

//     return (
//         <CardStatsListWrapper className="CardStatsListWrapper">
//             <CardStatsTableContainer className="CardStatsTableContainer">
//                 <CardStatsTable className="CardStatsTable">
//                     <QuestionHeaderBlock className="QuestionHeaderBlock">
//                         <QuestionHeader>Question</QuestionHeader>
//                         <QuestionHeader>Accuracy Rate</QuestionHeader>
//                         <QuestionHeader>Date Last Practiced</QuestionHeader>
//                         <QuestionHeader>Times Practiced</QuestionHeader>
//                     </QuestionHeaderBlock>
//                     {cardStatsByDeck.map((deck, index) => {
//                         if(deck.cards.length) {
//                             return (
//                                 <>
//                                     <DeckHeaderBlock className="DeckHeaderBlock">
//                                         <tr>
//                                             <DeckHeader className="DeckHeader" scope="row">Deck: {deck.name}</DeckHeader>
//                                         </tr>
//                                     </DeckHeaderBlock>  
                                    
//                                     <tbody>
//                                         {deck.cards.map(cardId => <CardStatsTile key={cardId} cardId={cardId} />)}
//                                     </tbody> 
//                                 </>
//                             );
//                         } else {
//                             return <></>
//                         }
//                     })}
//                 </CardStatsTable>
//             </CardStatsTableContainer>
//             {!cardStatsByDeck.map(deck => deck.cards).flat().length && <EmptyIndicator marginTop={3}>No cards have been practiced yet</EmptyIndicator>}
//         </CardStatsListWrapper>
//     );
// }

// export default CardStatsList;























































// import { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams } from "react-router";
// import { fetchCardStatsByDeck } from "../reducers/attemptsSlice";
// import CardStatsTile from "./CardStatsTile";
// import styled from "styled-components";
// import { EmptyIndicator } from "./StyledComponents/EmptyIndicator";

// const CardStatsListWrapper = styled.div`
//     padding-top: 4.5rem;
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     @media (max-width: 515px) {
//         padding-top: 6.5rem;
//     }
// `;

// const DeckBox = styled.div`
//     width: 100%;
//     margin-bottom: 2.5rem;
//     display: flex;
//     flex-direction: column;
//     align-items: center;
// `;

// const DeckHeader = styled.h1`
//     width: 90%;
//     background-color: blue;
//     margin-bottom: .5rem;
//     @media (max-width: 450px) {
//         width: 100%;
//     }
// `;

// function CardStatsList() {
//     const cardStatsByDeck = useSelector((state) => state.attempts.cardStatsByDeck);
//     const { userId } = useParams();
//     const dispatch = useDispatch();

//     const cardsRetrieved = useRef(false)
//     useEffect(() => {
//         if(!cardStatsByDeck.length && !cardsRetrieved.current) {
//             console.log("condition met")
//             dispatch(fetchCardStatsByDeck({userId}));
//             cardsRetrieved.current = true;
//         }
//     }, [cardStatsByDeck, dispatch, userId]);

//     return (
//         <CardStatsListWrapper>
//             {cardStatsByDeck.map(deck => {
//                 if(deck.cards.length) {
//                     return (
//                         <DeckBox>
//                             <DeckHeader>Deck: {deck.name}</DeckHeader>
//                             {deck.cards.map(cardId => <CardStatsTile key={cardId} cardId={cardId} />)}
//                         </DeckBox>
//                     );
//                 } else {
//                     return <></>
//                 }
//             })}
//             {!cardStatsByDeck.map(deck => deck.cards).flat().length && <EmptyIndicator marginTop={3}>No cards have been practiced yet</EmptyIndicator>}
//         </CardStatsListWrapper>
//     );
// }

// export default CardStatsList;