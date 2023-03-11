import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
// import { fetchDeckAttemptIds, fetchUserAttemptIds } from "../reducers/attemptsSlice";
import { fetchDeckAttempts, fetchUserAttempts } from "../reducers/attemptsSlice";
import { resetPracticedSinceAttemptsPulled } from "../reducers/practiceSessionSlice";
import styled from "styled-components";
import { EmptyIndicator } from './StyledComponents/EmptyIndicator';
import { HiOutlineExternalLink } from "react-icons/hi";

const DeckAttemptsTableWrapper = styled.div`
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

const DeckAttemptsTableContainer = styled.div`
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

const DeckAttemptRow = styled.tr`

`;

const DeckAttemptCell = styled.td`
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

export default function DeckAttemptsTable(props) {
    const userAttempts = useSelector((state) => state.attempts.userAttempts);
    const deckAttempts = useSelector((state) => state.attempts.deckAttempts);
    const selectedDeckId = useSelector((state) => state.attempts.selectedDeckId);
    const userId = useSelector((state) => state.login.userId);
    const practicedSinceAttemptsPulled = useSelector((state) => state.practiceSession.practicedSinceAttemptsPulled);
    const { deckId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const userAttemptsRetrieved = useRef(false);

    const handleSelectSession = (evt) => {
        navigate(`/users/${userId}/statistics/sessions/${evt.target.dataset.sessionId}`);
    } 

    useEffect(() => {
        if(props.allDecks) {
            if((!userAttempts.length && !userAttemptsRetrieved.current) || practicedSinceAttemptsPulled) {
                console.log("dispatching");
                dispatch(fetchUserAttempts({userId}));
                dispatch(resetPracticedSinceAttemptsPulled());
                userAttemptsRetrieved.current = true;
            }
        } else if(deckId !== selectedDeckId || practicedSinceAttemptsPulled) {
            dispatch(fetchDeckAttempts({deckId}));
            dispatch(resetPracticedSinceAttemptsPulled());
        }
    }, [userAttempts, deckId, dispatch, practicedSinceAttemptsPulled, props.allDecks, selectedDeckId, userId]);

    return (
        <DeckAttemptsTableWrapper>
            <DeckAttemptsTableContainer>
                <AttemptsTable>
                    <HeaderBlock>
                        <tr>
                            <Header>Date Practiced</Header>
                            <Header>Deck</Header>
                            <Header>Accuracy Rate</Header>
                            <Header>View Session</Header>
                        </tr>
                    </HeaderBlock>
                    <tbody>
                        {props.allDecks && 
                            (userAttempts.length ? 
                                userAttempts.map(attempt => (
                                    <DeckAttemptRow key={attempt._id}>
                                        <DeckAttemptCell>{attempt.datePracticed}</DeckAttemptCell>
                                        <DeckAttemptCell>{attempt.deck.name}</DeckAttemptCell>
                                        <DeckAttemptCell>{attempt.accuracyRate}%</DeckAttemptCell>
                                        <DeckAttemptCell><StyledLinkIcon data-sessionId={attempt._id} onClick={handleSelectSession}/></DeckAttemptCell>
                                    </DeckAttemptRow>
                                ))
                                :
                                <EmptyIndicator marginTop={3}>No decks have been practiced yet</EmptyIndicator>
                            )
                        }
                        {!props.allDecks && 
                            (deckAttempts.length ? 
                                deckAttempts.map(attempt => (
                                    <DeckAttemptRow>
                                        <DeckAttemptCell>{attempt.datePracticed}</DeckAttemptCell>
                                        <DeckAttemptCell>{attempt.deck.name}</DeckAttemptCell>
                                        <DeckAttemptCell>{attempt.accuracyRate}%</DeckAttemptCell>
                                        <DeckAttemptCell><StyledLinkIcon data-sessionId={attempt._id} onClick={handleSelectSession}/></DeckAttemptCell>
                                    </DeckAttemptRow>
                                ))
                                :
                                <EmptyIndicator marginTop={3}>This deck hasn't been practiced</EmptyIndicator>
                            )
                        }
                    </tbody>
                </AttemptsTable>
            </DeckAttemptsTableContainer>
        </DeckAttemptsTableWrapper>
    );
}
