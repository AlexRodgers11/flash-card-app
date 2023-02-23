import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import styled from "styled-components";
import DeckList from "./DeckList";

const UserDecksPageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #52B2FF; 
    // background-color: #4C4C9D;
    min-height: calc(100vh - 5.5rem);
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

function UserDecksPage() {
    const { userId } = useParams(); 
    const decks = useSelector((state) => state.login.decks)
    return (
        <UserDecksPageWrapper className="UserDecksPageWrapper">
            {!decks.length &&  <NoDecksMessage><p>No decks have been created yet</p></NoDecksMessage>}
            {/* <Link to={`/users/${userId}/decks/new`}><StyledButton>Create New Deck</StyledButton></Link> */}
            <StyledLink to={`/users/${userId}/decks/new`}>Create New Deck</StyledLink>
            <DeckList listType="user" listId={userId} />
        </UserDecksPageWrapper>
    );
}

export default UserDecksPage;