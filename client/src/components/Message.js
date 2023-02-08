import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { deleteMessage, markMessageAsRead } from '../reducers/communicationsSlice';
import DeckSubmissionMessage from './DeckSubmissionMessage';
import DeckDecisionMessage from './DeckDecisionMessage';
import JoinRequestMessage from './JoinRequestMessage';
import JoinDecisionMessage from './JoinDecisionMessage';
import { FaTrashAlt } from 'react-icons/fa';

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
					<div onClick={!props.fullView ? expandMessage : null}>
						<DeckSubmissionMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} setMessageRendered />
					</div>
				);
			case 'DeckDecision':
				return (
					<div onClick={!props.fullView ? expandMessage : null}>
						<DeckDecisionMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} setMessageRendered />
					</div>
				);
			case 'JoinRequest':
				return (
					<div onClick={!props.fullView ? expandMessage : null}>
						<JoinRequestMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} setMessageRendered />
					</div>
				);
			case "JoinDecision":
				return (
					<div onClick={!props.fullView ? expandMessage : null}>
						<JoinDecisionMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} setMessageRendered />
					</div>
				);
			default:
				return null;
		}
	}
	// if()

	return (
		<div>
			{renderMessage()}
			{messageRendered && <FaTrashAlt onClick={handleDeleteMessage} />}
		</div>
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
