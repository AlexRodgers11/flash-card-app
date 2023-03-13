import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { FaCheck, FaTimes } from "react-icons/fa";
import { HiOutlineExternalLink } from "react-icons/hi";
import styled from "styled-components";

const DeckAttemptCardsTableWrapper = styled.div`
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

const CardAttemptTableContainer = styled.div`
    height: calc(100vh - 5.5rem);
    overflow: scroll;
    display: flex;
    display: inline-flex;
    width: 80%;
    flex-direction: column;
    align-items: center;
    // background-color: red;
`;

const AttemptsTable = styled.table`
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
    
const HeaderBlock = styled.thead`
    background-color: black;
    border-top: 2px solid black;
    color: white;
    position: sticky;
    top: 0;
    overflow: auto;
    height: 5rem;
`;

const CardAttemptRow = styled.tr`

`;

const CardAttemptCell = styled.td`
    word-wrap: break-word;
    border: 1px solid black;
    padding: .5rem;
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
    

function DeckAttemptCardsTable() {
    const userId = useSelector((state) => state.login.userId);
    const deckAttempt = useSelector((state) => state.attempts.deckAttempt);
    const navigate = useNavigate();

    const handleSelectCard = (evt) => {
        navigate(`/users/${userId}/statistics/sessions/${evt.target.dataset.cardid}`);
    }     

    return (
        <DeckAttemptCardsTableWrapper className="DeckAttemptCardsTableWrapper">
            <CardAttemptTableContainer className="CardAttemptTableContainer">
            {deckAttempt.cards?.length &&
                <AttemptsTable className="CardAttemptTable">
                    <HeaderBlock className="QuestionHeaderBlock">
                        <Header>Question</Header>
                        <Header>Card Type</Header>
                        <Header>Answer given</Header>
                        <Header>Correct</Header>
                        <Header>View Card Stats</Header>
                    </HeaderBlock>
                    <tbody>
                        {deckAttempt.cards.map(card => (
                            <CardAttemptRow key={card._id}>
                                <CardAttemptCell>{card.question}</CardAttemptCell>
                                <CardAttemptCell>{card.cardType === "FlashCard" ? "Flash" : card.cardType === "TrueFalseCard" ? "True/False" : "Multiple Choice"}</CardAttemptCell>
                                <CardAttemptCell>{card.answeredCorrectly ? card.correctAnswer : card.cardType !== "FlashCard" ? card.wrongAnswerSelected : "N/A"}</CardAttemptCell>
                                <CardAttemptCell>{card.answeredCorrectly ? <FaCheck /> : <FaTimes />}</CardAttemptCell>
                                <CardAttemptCell><StyledLinkIcon data-cardId={card._id} onClick={handleSelectCard}/></CardAttemptCell>
                            </CardAttemptRow>
                        ))}
                    </tbody>
                </AttemptsTable>
            }
            </CardAttemptTableContainer>
        </DeckAttemptCardsTableWrapper>
    );
}

export default DeckAttemptCardsTable;



