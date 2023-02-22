import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { deleteCard } from '../reducers/deckSlice';
import PropTypes from 'prop-types'
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { FaTrashAlt } from "react-icons/fa";
import { MdModeEditOutline } from "react-icons/md";
import styled from 'styled-components';
import useToggle from '../hooks/useToggle';
import CardForm from './CardForm';
import Modal from './Modal';
import { client } from "../utils";

const baseURL = 'http://localhost:8000';

const CardWrapper = styled.div`
    position: relative;
    width: 60%;
    border: 1px solid black;
    border-radius: 1rem;
    margin-bottom: 1.5rem;
    background-color: white;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    @media (max-width: 850px) {
        width: 85%;
    }
    @media (max-width: 450px) {
        width: 95%;
        border-radius: .75rem;
    }
`;

const QuestionBlock = styled.div`
    display: flex;
    text-align: left;
    justify-content: space-between;
    align-items: center;
    font-size: 1.5rem;
    font-weight: 600;
    padding: 1rem 0;
    // color: #393939;
    &.answers-visible {
        // background-color: black;
        background-color: #393939;
        color: white;
        border-bottom: 1px solid black;
    }
    @media (max-width: 450px) {
        font-size: 1rem;
        padding: .75rem 0;
    }
`;

const AnswerBlock = styled.div`
    & p {
        text-align: left;
        padding: .5rem 2rem .5rem 2rem;
        border-bottom: 1px solid black;
        &:last-of-type {
            border-bottom: none;
        }
        @media (max-width: 450px) {
            font-size: .75rem;
            padding: .25rem 1.5rem .25rem 1.5rem;
        }
    }
`;

const CardControls = styled.div`
    display: flex;
    align-items: center;
    & span {
        margin-left: .5rem;
    }
    & svg {
        cursor: pointer;
        margin: .25rem; 
    }
`;

const LeftContainer = styled.div`
    display: flex;
`;

function Card(props) {
    const [cardData, setCardData] = useState({});
    const [showAnswers, toggleShowAnswers] = useToggle(false);
    const [modalContent, setModalContent] = useState("");
    const dispatch = useDispatch();

    const displayModalContent = () => {
        switch(modalContent) {
            case "edit-card":
                return <CardForm cardId={props.cardId} submit={handleSaveCardChanges}/>
            case "delete-card":
                return (
                    <div>
                        <h3>Are you sure you want to delete this card? This action cannot be undone.</h3>
                        <button onClick={() => setModalContent("")}>Cancel</button><button onClick={confirmDeleteCard}>Delete</button>
                    </div>
                );
            default:
                return;
        }
    }

    const handleSaveCardChanges = (editedCard) => {
        client.put(`${baseURL}/cards/${props.cardId}`, editedCard)
			.then(response => {
                console.log(response);
                if(response.request.status === 200) {
                    setCardData(editedCard);
                }
                hideModal();
            })
			.catch(err => console.error(err));
    }

    const hideModal = () => {
        setModalContent("");
    }

    const handleSelectModalContent = (evt) =>  {
        console.log({action: evt.currentTarget.dataset.action});
        setModalContent(evt.currentTarget.dataset.action);
    }



    const confirmDeleteCard = () => {
        dispatch(deleteCard({cardToDeleteId: props.cardId}));
        hideModal();
    }
    
    useEffect(() => {
        client.get(`${baseURL}/cards/${props.cardId}`)
            .then((response) => setCardData(response.data))
            .catch((err) => console.log(err));
    }, [props]);

    return (
        <CardWrapper>
            <QuestionBlock className={showAnswers ? "QuestionBlock answers-visible" : "QuestionBlock"}>
                <LeftContainer>
                    <CardControls>
                        {showAnswers ? <BsChevronUp role="button" onClick={toggleShowAnswers} /> : <BsChevronDown role="button" onClick={toggleShowAnswers} />}
                    </CardControls>
                    <p>{cardData.question}</p>
                </LeftContainer>
                <CardControls>
                    <FaTrashAlt role="button" data-action="delete-card" onClick={handleSelectModalContent}/>
                    <MdModeEditOutline role="button" data-action="edit-card" onClick={handleSelectModalContent}/>
                </CardControls>
            </QuestionBlock>
            {showAnswers &&
                <AnswerBlock>
                    <p>Hint: {cardData.hint || 'No hint given'}</p>
                    <p>Correct Answer: {cardData.correctAnswer}</p>
                    {cardData.cardType !== 'MultipleChoiceCard' ?
                        null
                        :
                        <>
                        <p>Wrong Answer One: {cardData.wrongAnswerOne}</p>
                        <p>Wrong Answer Two: {cardData.wrongAnswerTwo}</p>
                        <p>Wrong Answer Three: {cardData.wrongAnswerThree}</p>
                        </>
                    }
                </AnswerBlock>
            }

            {modalContent && 
                <Modal hideModal={hideModal}>
                    {displayModalContent()}
                </Modal>
            }
          
        </CardWrapper>
    )
}

Card.propTypes = { 
    cardId: PropTypes.string,
    displayMode: PropTypes.bool
}

export default Card
