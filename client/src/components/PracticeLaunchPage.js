import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DeckList from "./DeckList";
import styled from "styled-components";

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
        <div>
            {decks.length ? 
                <DeckList listType="user" listId={userId} />
                :
                <>
                    <NoDecksMessage>
                        <p>No decks have been created yet</p>
                    </NoDecksMessage>
                    <Link to={`/users/${userId}/decks/new`}><StyledButton>Create New Deck</StyledButton></Link>
                </>
            }
        </div>
    );
}

export default PracticeLaunchPage;