import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import styled from "styled-components";
import useShrinkingFont from "../hooks/useShrinkingFont";
import { v4 as uuidv4 } from "uuid";
import { useSelector } from "react-redux";

const baseURL = 'http://localhost:8000';

const CardStatsTileWrapper = styled(Link)`
    overflow: hidden;
    background-color: white;
    display: flex;
    width: 80%;
    height: 6rem;
    border: 1px solid black;
    border-radius: .5rem;
    margin-bottom: 1.5rem;
    &:first-of-type {
        margin-top: 1.5rem;
    }
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.12);
    @media (max-width: 850px) {
        width: 90%;
    }
    @media (max-width: 450px) {
        width: 95%;
        border-radius: .75rem;
        flex-direction: column;
        height: 8rem;
    }
`; 

const QuestionSection = styled.section`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: blue;
    border: 1px solid black;
    padding: .25rem;
    min-width: 30%;
    max-width: 30%;
    color: white;
    font-weight: 600;
    @media (max-width: 450px) {
        max-width: 100%;
        min-width: 100%;
        height: 40%;
    }

`;

const InfoSection = styled.div`
    display: flex;    
    justify-content: space-evenly;
    width: 70%;
    @media (max-width: 450px) {
        width: 100%;
        height: 60%;
    }
`;

const InfoBlock = styled.div`
    & p {
        display: flex;
        flex-direction: column;
        height: 50%;
        &:first-of-type {
            justify-content: flex-end;
            font-weight: 700;
            padding-bottom: 6%;
        }
        &:last-of-type {
            padding-top: 6%;
        }
        @media (max-width: 775px) {
            font-size: .75rem; 
        }
    }
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
`;

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
`;

const RowHeader = styled.th`
    overflow-wrap: anywhere;
    border: 1px solid black;
    padding: .5rem;
    text-align: left;
`;

function CardStatsTile(props) {
    const [cardData, setCardData]  = useState({});
    const userId = useSelector((state) => state.login.userId);

    useEffect(() => {
        if(!cardData.cardQuestion) {
            axios.get(`${baseURL}/cards/${props.cardId}/tile-stats`)
                .then((response) => setCardData(response.data))
                .catch((err) => console.error(err.message));
        }
    }, [cardData.cardQuestion, props.cardId]);

    if(!cardData.cardQuestion) {
        return <></>;
    }
    
    return (
        <TableRow className="TableRow">
            <RowHeader className="RowHeader">{cardData.cardQuestion}</RowHeader>
            <TableCell className="TableCell">{cardData.accuracyRate || "--"}%</TableCell>
            <TableCell className="TableCell">{cardData.dateLastPracticed || "--"}</TableCell>
            <TableCell className="TableCell">{cardData.attemptCount || 0}</TableCell>
        </TableRow>
        // <CardStatsTileWrapper className="CardStatsTileWrapper" to={`/users/${userId}/statistics/cards/${props.cardId}`} style={{opacity: doneResizing ? 1 : 0}}>
        //     <QuestionSection className="QuestionSection" ref={QuestionSectionRef}>
        //         <p className="QuestionSectionParagraph"  ref={ParagraphTagRef} style={{fontSize: fontSize}}>
        //             {cardData.cardQuestion.split(" ").map(word => <span key={uuidv4()} className="word">{word} </span>)}
        //         </p>
        //     </QuestionSection>
        //     <InfoSection>
        //         <InfoBlock>
        //             <p>Accuracy Rate:</p>
        //             <p>{cardData.accuracyRate || "--"}%</p>
        //         </InfoBlock>
        //         <InfoBlock>
        //             <p>Last practiced</p>
        //             <p>{cardData.dateLastPracticed || "--"}</p>
        //         </InfoBlock>
        //         <InfoBlock>
        //             <p># Times Practiced:</p>
        //             <p>{cardData.attemptCount || 0}</p>
        //         </InfoBlock>
        //     </InfoSection>
        // </CardStatsTileWrapper>
    );
}

export default CardStatsTile;


// import axios from "axios";
// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router";
// import { Link } from "react-router-dom";
// import styled from "styled-components";
// import useShrinkingFont from "../hooks/useShrinkingFont";
// import { v4 as uuidv4 } from "uuid";

// const baseURL = 'http://localhost:8000';

// const CardStatsTileWrapper = styled(Link)`
//     overflow: hidden;
//     background-color: white;
//     display: flex;
//     width: 80%;
//     height: 6rem;
//     border: 1px solid black;
//     border-radius: .5rem;
//     margin-bottom: 1.5rem;
//     &:first-of-type {
//         margin-top: 1.5rem;
//     }
//     box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.12);
//     @media (max-width: 850px) {
//         width: 90%;
//     }
//     @media (max-width: 450px) {
//         width: 95%;
//         border-radius: .75rem;
//         flex-direction: column;
//         height: 8rem;
//     }
// `; 

// const QuestionSection = styled.section`
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     background-color: blue;
//     border: 1px solid black;
//     padding: .25rem;
//     min-width: 30%;
//     max-width: 30%;
//     color: white;
//     font-weight: 600;
//     @media (max-width: 450px) {
//         max-width: 100%;
//         min-width: 100%;
//         height: 40%;
//     }

// `;

// const InfoSection = styled.div`
//     display: flex;    
//     justify-content: space-evenly;
//     width: 70%;
//     @media (max-width: 450px) {
//         width: 100%;
//         height: 60%;
//     }
// `;

// const InfoBlock = styled.div`
//     & p {
//         display: flex;
//         flex-direction: column;
//         height: 50%;
//         &:first-of-type {
//             justify-content: flex-end;
//             font-weight: 700;
//             padding-bottom: 6%;
//         }
//         &:last-of-type {
//             padding-top: 6%;
//         }
//         @media (max-width: 775px) {
//             font-size: .75rem; 
//         }
//     }
//     padding: 0 1rem;
//     display: flex;
//     flex-direction: column;
// `;

// const breakpointsAndFonts = [
//     {width: 0, fontSize: 24}, 
//     {width: 450, fontSize: 24}, 
//     {width: 775, fontSize: 30}, 
//     {width: 1000, fontSize: 32}
// ];


// function CardStatsTile(props) {
//     const [cardData, setCardData]  = useState({});
//     const { userId } = useParams();

//     const QuestionSectionRef = useRef();
//     const ParagraphTagRef = useRef();
//     const [fontSize, doneResizing] = useShrinkingFont(32, breakpointsAndFonts,QuestionSectionRef, ParagraphTagRef, cardData.cardQuestion);

//     useEffect(() => {
//         if(!cardData.cardQuestion) {
//             axios.get(`${baseURL}/cards/${props.cardId}/tile-stats`)
//                 .then((response) => setCardData(response.data))
//                 .catch((err) => console.error(err.message));
//         }
//     }, [cardData.cardQuestion, props.cardId]);

//     if(!cardData.cardQuestion) {
//         return <></>;
//     }
    
//     return (

//         <CardStatsTileWrapper className="CardStatsTileWrapper" to={`/users/${userId}/statistics/cards/${props.cardId}`} style={{opacity: doneResizing ? 1 : 0}}>
//             <QuestionSection className="QuestionSection" ref={QuestionSectionRef}>
//                 <p className="QuestionSectionParagraph"  ref={ParagraphTagRef} style={{fontSize: fontSize}}>
//                     {cardData.cardQuestion.split(" ").map(word => <span key={uuidv4()} className="word">{word} </span>)}
//                 </p>
//             </QuestionSection>
//             <InfoSection>
//                 <InfoBlock>
//                     <p>Accuracy Rate:</p>
//                     <p>{cardData.accuracyRate || "--"}%</p>
//                 </InfoBlock>
//                 <InfoBlock>
//                     <p>Last practiced</p>
//                     <p>{cardData.dateLastPracticed || "--"}</p>
//                 </InfoBlock>
//                 <InfoBlock>
//                     <p># Times Practiced:</p>
//                     <p>{cardData.attemptCount || 0}</p>
//                 </InfoBlock>
//             </InfoSection>
//         </CardStatsTileWrapper>
//     );
// }

// export default CardStatsTile;