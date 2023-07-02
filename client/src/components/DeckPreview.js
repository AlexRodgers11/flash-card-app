import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate, useParams } from "react-router";
import useFormInput from "../hooks/useFormInput";
import { fetchDeck} from "../reducers/deckSlice";
import useToggle from "../hooks/useToggle";
import Card from "./Card";
import styled from "styled-components";
import { EmptyIndicator } from "./StyledComponents/EmptyIndicator";
import { fetchCategories } from "../reducers/decksSlice";
import { fetchDecksOfGroup } from '../reducers/decksSlice';
import { makeDeckSubmissionDecision } from '../reducers/communicationsSlice';

const DeckWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: calc(100vh - 5.5rem);
    background-color: #52B2FF; 
    padding-bottom: 3rem;
    
`;

const ButtonBlock = styled.div`
    & button {
        margin: 1rem .5rem 2.5rem .5rem;
    }
`;
    
const NameBlock = styled.div`
    display: flex;
    justify-content: center;
    color: white;
    padding-top: 1.5rem;
    &.name-only {
        margin-bottom: 2rem;
    }
    & h1 {
        font-size: 3.5rem;
        @media (max-width: 750px) {
            font-size: 2.75rem;
        }
        @media (max-width: 450px) {
            font-size: 1.5rem;
        }
    }
`;

const CardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
`;

function DeckPreview(props) {
    const userId = useSelector((state) => state.login.userId);
    const deckListType = useSelector((state) => state.decks.listType);
    const deckListId = useSelector((state) => state.decks.listId);
    const storedDeckId = useSelector((state) => state.deck.deckId);
    const userDecks = useSelector((state) => state.login.decks);
    const name = useSelector((state) => state.deck.name);
    const [nameEditMode, toggleNameEditMode] = useToggle(false);
    const [decision, setDecision] = useState("");
	const [comment, clearComment, handleCommentChange, setComment] = useFormInput("");
    const [loading, setLoading] = useState(true);
    const administrators = useSelector((state) => state.group.administrators)
    const category = useSelector((state) => state.deck.category);
    const categories = useSelector((state) => state.decks.categories);
    const [editedName, clearEditedName, handleChangeEditedName, setEditedName] = useFormInput("");
    const publiclyAvailable = useSelector((state) => state.deck.publiclyAvailable);
    const allowCopies = useSelector((state) => state.deck.allowCopies);
    const cards = useSelector((state) => state.deck.cards);
    const groupDeckBelongsTo = useSelector((state) => state.deck.groupDeckBelongsTo);
    const [modalContent, setModalContent] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { deckId } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const adminReview = searchParams.get("review");
    const groupId = searchParams.get("group");
    const messageId = searchParams.get("message");
    
    const displayModalContent = () => {
        switch(modalContent) {
            default:
                return;
        }
    }

    const acceptDeck = () => {
        setDecision("approved");
    }

    const denyDeck = () => {
        setDecision("denied");
    }

    const handleSelectModalContent = (evt) =>  {
        setModalContent(evt.target.dataset.action);
    }

    const hideModal = () => {
        setModalContent("");
    }

    const submitDeckDecision = () => {
        dispatch(makeDeckSubmissionDecision({messageId: messageId, decision, comment}))
            .then((response) => {
                if(!response.payload.sentMessage) {
                    alert(response.payload);
                } 
                if((response.payload.acceptanceStatus === "approved" && deckListType === "group") && deckListId === groupId) {
                    dispatch(fetchDecksOfGroup({groupId: groupId}));
                }
                navigate(-1);
            });
        
    }

    const clearDecision = () => {
        setComment("");
        setDecision("");
    }
    
    useEffect(() => {
        if((!storedDeckId || storedDeckId !== deckId) || categories.length < 1) {
            dispatch(fetchDeck(deckId)); 
            dispatch(fetchCategories());
        }
    }, [categories, deckId, dispatch, storedDeckId]);

    if(storedDeckId !== deckId || categories.length < 1) {
        return <DeckWrapper></DeckWrapper>
    } 
    return (
        <DeckWrapper>
            {adminReview === "true" && <p>Test</p>}
            <NameBlock>
                <h1>{name}</h1> 
            </NameBlock>

            {!decision ?
                <ButtonBlock>
                    <button className="btn btn-success btn-md" onClick={acceptDeck}>Accept</button><button className="btn btn-danger btn-md" onClick={denyDeck}>Decline</button>
                </ButtonBlock>
                :
                <div>
                    <textarea name="comments" id="comments" onChange={handleCommentChange} value={comment} placeholder="Add a comment (optional)"></textarea>
                    <button className="btn btn-primary btn-md" onClick={submitDeckDecision}>Submit decision to {decision === "approved" ? "approve" : "deny"} the request</button><button className="btn btn-danger btn-md" onClick={clearDecision}>Cancel</button>
                </div>
            }
            
                
            <CardContainer className="CardContainer">
                {!cards.length && <EmptyIndicator>No cards have been created yet</EmptyIndicator>}
                {cards.map(card => <Card cardId={card} allowedToEdit={false} />
                )}

                {/* {modalContent && 
                    <Modal hideModal={hideModal}>
                        {displayModalContent()}
                    </Modal>
                } */}
            </CardContainer>
        </DeckWrapper>
    )
    
}

export default DeckPreview;
