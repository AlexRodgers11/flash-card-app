import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DeckList from "./DeckList";
import styled from "styled-components";

const PracticeLaunchPageWrapper = styled.div`
    background-color: #5197E1; --lighter blue
    // background-color: #4C4C9D; --darker blue
    min-height: calc(100vh - 5.5rem);
    & h1 {
        padding: 1rem;
        color: white;
        text-shadow: 1px 1px 2px #333;
    }
`;

const NoDecksMessage = styled.div`
    margin-top: 2rem;
    font-size: 1.5rem;
    font-style: italic; 
    color: #616161;
    margin-bottom: 1rem;
    @media (max-width: 400px) {
        font-size: 1.25rem;
    }
`;

const StyledButton = styled.button`
    margin: 4rem 0 3rem 0;
    width: 14rem;
    height: 5rem;
    border-radius: 1rem;
`;

function PracticeLaunchPage() {
    const decks = useSelector((state) => state.login.decks);
    const userId = useSelector((state) => state.login.userId);

    return (
        <PracticeLaunchPageWrapper>
            {decks.length ? 
                <>
                    <h1>Select a deck to practice</h1>
                    <DeckList listType="user" listId={userId} />
                </>
                :
                <>
                    <NoDecksMessage>
                        <p>No decks have been created yet</p>
                    </NoDecksMessage>
                    <Link to={`/users/${userId}/decks/new`}><StyledButton>Create New Deck</StyledButton></Link>
                </>
            }
        </PracticeLaunchPageWrapper>
    );
}

export default PracticeLaunchPage;