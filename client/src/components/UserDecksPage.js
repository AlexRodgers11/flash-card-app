import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import styled from "styled-components";
import DeckList from "./DeckList";

const UserDecksPageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StyledButton = styled.button`
    margin: 4rem 0 3rem 0;
    width: 14rem;
    height: 5rem;
    border-radius: 1rem;
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


function UserDecksPage() {
    const { userId } = useParams(); 
    const decks = useSelector((state) => state.login.decks)
    return (
        <UserDecksPageWrapper className="UserDecksPageWrapper">
            {!decks.length &&  <NoDecksMessage><p>No decks have been created yet</p></NoDecksMessage>}
            <Link to={`/users/${userId}/decks/new`}><StyledButton>Create New Deck</StyledButton></Link>
            <DeckList listType="user" listId={userId} />
        </UserDecksPageWrapper>
    );
}

export default UserDecksPage;