import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { markMessageAsRead } from '../reducers/communicationsSlice';
import DeckSubmissionMessage from './DeckSubmissionMessage';
import DeckDecisionMessage from './DeckDecisionMessage';
import JoinRequestMessage from './JoinRequestMessage';
import JoinDecisionMessage from './JoinDecisionMessage';

function Message(props) {
	const dispatch = useDispatch();
	const userId = useSelector((state) => state.login.userId);
	
	const expandMessage = () => {
		console.log("expanding message");
		props.expandMessage(props.messageId, props.messageType);
		if(!props.read) {
			dispatch(markMessageAsRead({messageId: props.messageId, direction: props.direction, readerId: userId}));
		}
	}
	
	const renderMessage = () => {
		console.log("In render message");
		switch(props.messageType) {
			case '':
				return null;
			case 'DeckSubmission':
				console.log("DeckSubmission message found");
				return (
					<div onClick={!props.fullView ? expandMessage : null}>
						<DeckSubmissionMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} />
					</div>
				);
			case 'DeckDecision':
				console.log("DeckDecision message found");
				return (
					<div onClick={!props.fullView ? expandMessage : null}>
						<DeckDecisionMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} />
					</div>
				);
			case 'JoinRequest':
				console.log("Join request message");
				return (
					<div onClick={!props.fullView ? expandMessage : null}>
						<JoinRequestMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} />
					</div>
				);
			case "JoinDecision":
				console.log("JoinDecision message");
				return (
					<div onClick={!props.fullView ? expandMessage : null}>
						<JoinDecisionMessage messageId={props.messageId} messageType={props.messageType} fullView={props.fullView} hideModal={props.hideModal} direction={props.direction} />
					</div>
				);
			default:
				return null;
		}
	}
	
	return (
		<div>{renderMessage()}</div>
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
