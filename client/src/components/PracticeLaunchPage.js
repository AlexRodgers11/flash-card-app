import { useSelector } from "react-redux";
import DeckList from "./DeckList";
import styled from "styled-components";
import useToggle from "../hooks/useToggle";
import DeckForm from "./DeckForm";
import Modal from "./Modal";

const PracticeLaunchPageWrapper = styled.div`
    display: flex;
    flex-direction: column;    
    align-items: center;
    background-color: #52B2FF; 
    min-height: calc(100vh - 5.5rem);
    // background-color: #4C4C9D; --darker blue
`;

const Title = styled.h1`
    color: white;
    font-size: 4rem;
    padding: 1rem 0 2rem 0;
    @media (max-width: 900px) {
        font-size: 3.5rem;
    }
    @media (max-width: 700px) {
        font-size: 3rem;
    }
    @media (max-width: 575px) {
        font-size: 2.5rem;
    }
    @media (max-width: 475px) {
        font-size: 2rem;
        padding: .5rem 0 1rem 0;
    }
    @media (max-width: 375px) {
        font-size: 1.75rem;
    }
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

function PracticeLaunchPage() {
    const deckIds = useSelector((state) => state.login.decks);
    const userId = useSelector((state) => state.login.userId);
    const [showDeckForm, toggleShowDeckForm] = useToggle(false);

    return (
        <PracticeLaunchPageWrapper>
            {!deckIds.length && 
                <AddButton className="btn btn-primary btn-lg" data-action="add-card" onClick={toggleShowDeckForm}>Create New Deck</AddButton>
            }
            {deckIds.length > 0 && 
                <Title>Select a Deck to Practice</Title>
            }   
            <DeckList listType="user" listId={userId} />
            {showDeckForm && 
                <Modal hideModal={toggleShowDeckForm}>
                    <DeckForm />
                </Modal>
            }
        </PracticeLaunchPageWrapper>
    )
}

export default PracticeLaunchPage;