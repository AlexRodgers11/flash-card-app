import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { fetchCardAttempts } from "../reducers/attemptsSlice";
import { FaCheck, FaTimes } from "react-icons/fa";
import { HiOutlineExternalLink } from "react-icons/hi";
import styled from "styled-components";

const CardAttemptsTableWrapper = styled.div`
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

const CardAttemptTableContainer = styled.div`
    height: calc(100vh - 5.5rem);
    overflow: scroll;
    display: flex;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1rem;
    width: 80%;
    @media (max-width: 650px) {
        width: 85%;
    }
    @media (max-width: 550px) {
        width: 95%;
    }
    &:-webkit-scrollbar {
        display: auto;
    }
    
`;

const AttemptsTable = styled.table`
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
    
const HeaderBlock = styled.thead`
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

const CardIdentifiers = styled.div`
    background-color: white;
    padding: 1rem;
    border: 2px solid black;
    border-radius: 1rem;
`;

const Header = styled.th.attrs({
    scope: "col"
})`
    border: 1px solid black;
    // background-color: #bfbfbf;
    // background-color: blue;
    background-color: #393939;
    padding: 0 1rem;
`;

const TableRow = styled.tr.attrs({
    scope: "row"
})`
    width: 100%;
`;

const TableCell = styled.td`
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

const StyledLinkIcon = styled(HiOutlineExternalLink).attrs({
    role: "button"
})`
    height: 1.5rem;
    width: 1.5rem;
    @media (max-width: 650px) {
        height: 1.25rem;
        width: 1.25rem;
    }
`;

function CardAttemptsTable() {
    const userId = useSelector((state) => state.login.userId);
    // const attemptIds = useSelector((state) => state.attempts.cardAttemptIds);
    const attempts = useSelector((state) => state.attempts.cardAttempts);
    // const selectedCardId = useSelector((state) => state.attempts.selectedCardId);
    // const selectedCardQuestion = useSelector((state) => state.attempts.selectedCardQuestion);
    // const selectedCardAnswer = useSelector((state) => state.attempts.selectedCardAnswer);
    const selectedCard = useSelector((state) => state.attempts.selectedCard);
    const { cardId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const handleSelectCard = (evt) => {
        navigate(`/users/${userId}/statistics/sessions/${evt.currentTarget.dataset.attemptid}`);
    }

    useEffect(() => {
        if(cardId !== selectedCard._id) {
            console.log("should be fetching attemptIds");
            dispatch(fetchCardAttempts({cardId}));
        }
    }, [cardId, selectedCard._id, dispatch]);
    
    if(selectedCard._id !== cardId) {
        return <></>
    }

    return (
        <CardAttemptsTableWrapper className="CardAttemptsTableWrapper">
            <CardIdentifiers>
                <h1><strong>Question: </strong>{selectedCard.question}</h1>
                <h4><strong>Answer: </strong>{selectedCard.answer}</h4>
                <h4><strong>Card Type: </strong>{selectedCard.cardType === "FlashCard" ? "Flash" : selectedCard.cardType === "TrueFalseCard" ? "True/False" : "Multiple Choice"}</h4>

            </CardIdentifiers>
            <CardAttemptTableContainer className="CardAttemptTableContainer">
                <AttemptsTable className="CardAttemptTable">
                    <HeaderBlock className="QuestionHeaderBlock">
                        <Header>Date Practiced</Header>
                        <Header>Correct</Header>
                        <Header>Answer Given</Header>
                        <Header>View Entire Session</Header>
                    </HeaderBlock>
                    <tbody>
                    {
                        attempts.map(attempt => (
                            <TableRow key={attempt._id}>
                                <TableCell>{attempt.datePracticed}</TableCell>
                                <TableCell>{attempt.answeredCorrectly ? <FaCheck /> : <FaTimes />}</TableCell>
                                <TableCell>{attempt.answeredCorrectly ? selectedCard.answer : selectedCard.cardType !== "FlashCard" ? attempt.wrongAnswerSelected : "N/A"}</TableCell>
                                <TableCell><StyledLinkIcon data-attemptid={attempt.fullDeckAttempt} onClick={handleSelectCard}/></TableCell>
                            </TableRow>            
                        ))
                    }
                    {!attempts.length && 
                        <TableRow>
                        <TableCell>--</TableCell>
                        <TableCell>--</TableCell>
                        <TableCell>--</TableCell>
                        <TableCell>N/A</TableCell>
                    </TableRow>                
                    }
                    </tbody>
                </AttemptsTable>
            </CardAttemptTableContainer>
        </CardAttemptsTableWrapper>
    );
}

export default CardAttemptsTable;



