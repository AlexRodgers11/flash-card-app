import { useSelector } from "react-redux";
import styled from "styled-components";
import useToggle from "../hooks/useToggle";
import DeckForm from "./DeckForm";
import DeckList from "./DeckList";
import Modal from "./Modal";

const UserDecksPageWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #52B2FF; 
    // background-color: #4C4C9D;
    min-height: calc(100vh - 5.5rem);
`;

const AddButton = styled.button`
    width: 50%;
    margin: 2rem;
    background-color: #051647;
    border: none;
    @media (max-width: 450px) {
        margin: .75rem;        
        font-size: .75rem;
        padding: .125rem .75rem;
    }
`;

function UserDecksPage() {
    const userId = useSelector((state) => state.login.userId);
    const [showDeckForm, toggleShowDeckForm] = useToggle(false);
    return (
        <UserDecksPageWrapper className="UserDecksPageWrapper">
            <AddButton className="btn btn-primary btn-lg" data-action="add-card" onClick={toggleShowDeckForm}>Create New Deck</AddButton>
            <DeckList listType="user" listId={userId} />
            {showDeckForm && 
                <Modal hideModal={toggleShowDeckForm}>
                    <DeckForm />
                </Modal>
            }
        </UserDecksPageWrapper>
    );
}

export default UserDecksPage;