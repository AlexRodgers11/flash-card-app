import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DeckList from "./DeckList";
import styled from "styled-components";

const PracticeLaunchPageWrapper = styled.div`
    display: flex;
    flex-direction: column;    
    align-items: center;
    background-color: #5197E1;
    min-height: calc(100vh - 5.5rem);
    // background-color: #4C4C9D; --darker blue
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

const StyledLink = styled(Link)`
    font-size: 1rem;
    padding: 2rem;
    margin: 4rem 0 3rem 0;
    width: 14rem;
    // height: 5rem;
    border-radius: 1rem;
    border: 2px solid black;
    background-color: lightgrey;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px 0px;
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
                    <StyledLink to={`/users/${userId}/decks/new`}>Create New Deck</StyledLink>
                </>
            }
        </PracticeLaunchPageWrapper>
    );
}

export default PracticeLaunchPage;