import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { FaCheck, FaTimes } from "react-icons/fa";
import { HiOutlineExternalLink } from "react-icons/hi";
import styled from "styled-components";

const DeckAttemptCardsTableWrapper = styled.div`
    width: 100vw;
    padding-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 9.5rem;
    // pointer-events: auto;
    @media (max-width: 515px) {
        padding-top: 1rem;
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
    width: 80%;
    @media (max-width: 650px) {
        width: 85%;
    }
    @media (max-width: 550px) {
        width: 95%;
    }
    flex-direction: column;
    align-items: center;
    // background-color: red;
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

const CardAttemptRow = styled.tr`

`;

const CardAttemptCell = styled.td`
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

const Header = styled.th.attrs({
    scope: "col"
})`
    border: 1px solid black;
    background-color: #bfbfbf;
    background-color: blue;
    background-color: #393939;
    padding: 0 1rem;
    @media (max-width: 650px) {
        padding: 0 .75rem;
    }
    @media (max-width: 550px) {
        padding: 0 .5rem;
    }
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
    

function DeckAttemptCardsTable() {
    const userId = useSelector((state) => state.login.userId);
    const deckAttempt = useSelector((state) => state.attempts.deckAttempt);
    const navigate = useNavigate();

    const handleSelectCard = (evt) => {
        // navigate(`/users/${userId}/statistics/sessions/${evt.currentTarget.dataset.cardid}`);
        navigate(`/users/${userId}/statistics/cards/${evt.currentTarget.dataset.cardid}`);
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
                        {/* <Header>View Card Stats</Header>- come back and make CardStats Page that includes both the average stats and a list of past card attempts */}
                        <Header>View Card Attempts</Header>
                    </HeaderBlock>
                    <tbody>
                        {deckAttempt.cards.map(cardAttempt => (
                            <CardAttemptRow key={cardAttempt._id}>
                                <CardAttemptCell>{cardAttempt.question}</CardAttemptCell>
                                <CardAttemptCell>{cardAttempt.cardType === "FlashCard" ? "Flash" : cardAttempt.cardType === "TrueFalseCard" ? "True/False" : "Multiple Choice"}</CardAttemptCell>
                                <CardAttemptCell>{cardAttempt.answeredCorrectly ? cardAttempt.correctAnswer : cardAttempt.cardType !== "FlashCard" ? cardAttempt.wrongAnswerSelected : "N/A"}</CardAttemptCell>
                                <CardAttemptCell>{cardAttempt.answeredCorrectly ? <FaCheck /> : <FaTimes />}</CardAttemptCell>
                                <CardAttemptCell><StyledLinkIcon data-cardid={cardAttempt.cardId} onClick={handleSelectCard}/></CardAttemptCell>
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



