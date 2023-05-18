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

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const CardWrapper = styled.div`
    position: relative;
    width: 55%;
    border: 1px solid black;
    border-radius: 1rem;
    margin-bottom: 1.5rem;
    background-color: white;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    @media (max-width: 1625px) {
        width: 65%;
    }
    @media (max-width: 1500px) {
        width: 70%
    }
    @media (max-width: 1000px) {
        width: 75%
    }
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
    // width: 100%;
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
        & span.label {
            font-weight: 600;
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
                return <CardForm cardId={props.cardId} submit={handleSaveCardChanges} buttonText="Save"/>
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
        <CardWrapper className="CardWrapper">
            <QuestionBlock className={showAnswers ? "QuestionBlock answers-visible" : "QuestionBlock"}>
                <LeftContainer>
                    <CardControls>
                        {showAnswers ? <BsChevronUp role="button" onClick={toggleShowAnswers} /> : <BsChevronDown role="button" onClick={toggleShowAnswers} />}
                    </CardControls>
                    <p>{cardData.question}</p>
                </LeftContainer>
                {props.allowedToEdit &&
                    <CardControls>
                        <FaTrashAlt role="button" data-action="delete-card" onClick={handleSelectModalContent}/>
                        <MdModeEditOutline role="button" data-action="edit-card" onClick={handleSelectModalContent}/>
                    </CardControls>
                }
            </QuestionBlock>
            {showAnswers &&
                <AnswerBlock>
                    <p><span className="label">Hint: </span>{cardData.hint || 'No hint given'}</p>
                    <p><span className="label">Correct Answer: </span>{cardData.correctAnswer}</p>
                    {cardData.cardType !== 'MultipleChoiceCard' ?
                        null
                        :
                        <>
                        <p><span className="label">Wrong Answer One: </span>{cardData.wrongAnswerOne}</p>
                        <p><span className="label">Wrong Answer Two: </span>{cardData.wrongAnswerTwo}</p>
                        <p><span className="label">Wrong Answer Three: </span>{cardData.wrongAnswerThree}</p>
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
