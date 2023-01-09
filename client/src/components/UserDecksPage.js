import { useParams } from "react-router";
import { Link } from "react-router-dom";
import styled from "styled-components";
import DeckList from "./DeckList";

const UserDecksPageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`

const StyledButton = styled.button`
    margin: 4rem 0 3rem 0;
    width: 14rem;
    height: 5rem;
    border-radius: 1rem;
`

function UserDecksPage() {
    const { userId } = useParams(); 
    return (
        <UserDecksPageWrapper className="UserDecksPageWrapper">
            <Link to={`/users/${userId}/decks/new`}><StyledButton>Create New Deck</StyledButton></Link>
            <DeckList listType="user" listId={userId} />
        </UserDecksPageWrapper>
    );
}

export default UserDecksPage;