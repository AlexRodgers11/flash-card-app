import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { deleteMessage, markMessageAsRead } from '../reducers/communicationsSlice';
import DeckSubmissionMessage from './DeckSubmissionMessage';
import DeckDecisionMessage from './DeckDecisionMessage';
import JoinRequestMessage from './JoinRequestMessage';
import JoinDecisionMessage from './JoinDecisionMessage';
import { FaTrashAlt } from 'react-icons/fa';
import styled from 'styled-components';

const MessageWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	text-align: left;
	padding: .75rem 1.25rem;
	border: 1px solid black;
	border-bottom: none;
	cursor: ${(props) => props.fullView ? "default" : "pointer"};
	&:last-of-type {
		border-bottom: 1px solid black;
	}
	&:hover {
		background-color: ${(props) => props.fullView ? "inherit" : "black"};
		color: ${(props) => props.fullView ? "inherit" : "white"};
	}
`;

const StyledTrashAlt = styled(FaTrashAlt)`
	height: 1.25rem;
	width: 1.25rem; 
	@media (max-width: 450px) {
		height: 1rem;
		width: 1rem;
	}
`;

function Message(props) {
	const dispatch = useDispatch();
	const userId = useSelector((state) => state.login.userId);
	const [messageRendered, setMessageRendered] = useState(false);

	const handleDeleteMessage = () => {
		dispatch(deleteMessage({messageId: props.messageId, direction: props.direction}));
	}
	
	const expandMessage = () => {
		console.log("expanding message");
		props.expandMessage(props.messageId, props.messageType, props.messageDirection);
		if(!props.read) {
			dispatch(markMessageAsRead({messageId: props.messageId, direction: props.direction, readerId: userId}));
		}
	}
	
	const renderMessage = () => {
		switch(props.messageType) {
			case '':
				return null;
			case 'DeckSubmission':
				return (
					<DeckSubmissionMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} setMessageRendered={setMessageRendered} />
				);
			case 'DeckDecision':
				return (
					<DeckDecisionMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} setMessageRendered={setMessageRendered} />
				);
			case 'JoinRequest':
				return (
					<JoinRequestMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} setMessageRendered={setMessageRendered} />
				);
			case "JoinDecision":
				return (
					<JoinDecisionMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} setMessageRendered={setMessageRendered} />
				);
			default:
				return null;
		}
	}

	return (
		<MessageWrapper fullView={props.fullView}>
			<div role={props.fullView ? "" : "button"} onClick={!props.fullView ? expandMessage : null}>
				{renderMessage()}
			</div>
			{messageRendered && <StyledTrashAlt onClick={handleDeleteMessage} />}
		</MessageWrapper>
	)
}

Message.propTypes = {
	direction: PropTypes.string,
    messageId: PropTypes.string,
	messageType: PropTypes.string,
	read: PropTypes.bool,
	expandMessage: PropTypes.func,
	hideModal: PropTypes.func
}

export default Message
