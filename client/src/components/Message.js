import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { addDeck } from '../reducers/decksSlice';
import { addActivity } from '../reducers/groupSlice';
import { editMessage } from '../reducers/loginSlice';

const baseURL = 'http://localhost:8000';

function Message(props) {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const userId = useSelector((state) => state.login.userId);
	const [messageType, setMessageType] = useState('');
	const [sender, setSender] = useState({});
	const [receiver, setReceiver] = useState({});
	const [target, setTarget] = useState({});
	const [content, setContent] = useState('');
	const [read, setRead] = useState(false);
	const [acceptanceStatus, setAcceptanceStatus] = useState('');

	//may need to change this to just accept so card acceptance is same, and then choose route conditionally

	const acceptDeck = () => {
		if(acceptanceStatus === 'pending') {
			axios.put(`${baseURL}/messages/${props.messageId}`, {acceptanceStatus: 'accepted', messageType: 'DeckSubmission'})
			.catch(err => {
				console.error(err)
			})
			.then(acceptanceResponse => {
				axios.post(`${baseURL}/groups/${receiver._id}/decks?accepted=true`, {idOfDeckToCopy: target._id})
				.then((deckPostResponse) => {
					let notification = {
						type: 'DeckDecision',
						decision: 'approved',
						read: false,
						actor: userId,
						groupTarget: receiver._id,
						deckTarget: target._id
					}
					axios.post(`${baseURL}/users/${sender._id}/notifications`, notification)
					.then(() => {
						props.hideModal();
						//adds deck to decks slice of store, which is only desired if user is on Group page, could try to conditionally call this based on location or refactor how deckList is handled in store
						dispatch(addDeck(deckPostResponse.data.newDeck));
						dispatch(addActivity(deckPostResponse.data.newActivity));
						dispatch(editMessage({direction: 'sent', message:acceptanceResponse.data}));
					})
					.catch(notificationErr => {
						console.error(notificationErr);
					});
				})
				.catch(deckAddErr => {
					console.error(deckAddErr);
				});
			});
		} else {
			alert(`This deck has already been ${acceptanceStatus}`);//need to change acceptance status in this function
		}
	}

	const denyDeck = () => {
		if(acceptanceStatus === 'pending') {
			axios.put(`${baseURL}/messages/${props.messageId}`, {acceptanceStatus: 'denied', messageType: 'DeckSubmission'})
			.catch(err => {
				console.error(err)
			})
			.then(acceptanceResponse => {
				let notification = {
					type: 'DeckDecision',
					decision: 'denied',
					read: false,
					actor: userId,
					groupTarget: receiver._id,
					deckTarget: target._id
				}
				axios.post(`${baseURL}/users/${sender._id}/notifications`, notification)
					.then(() => {
						props.hideModal();
						dispatch(editMessage({direction: 'sent', message:acceptanceResponse.data}));
					})
					.catch(notificationErr => {
						console.error(notificationErr);
					});
			});
		} else {
			alert(`This deck has already been ${acceptanceStatus}`);//need to change acceptance status in this function
		}
	}
	
	const expandMessage = () => {
		props.expandMessage(props.messageId);
		//send PUT request to add user to read array for the message (in case others received same message)
		axios.put(`${baseURL}/messages/${props.messageId}`, {user: userId})
			.then(response => {
				console.log(response.data);
				dispatch(editMessage({direction: 'sent', message: response.data}));
			})
			.catch(err => {
				console.error(err);
			});
	}
	
	const renderMessage = () => {
		switch(messageType) {
			case '':
				return null;
			case 'DeckSubmission':
				return (
						<>
						{props.fullView ? 
							<div>
								<p><span>{sender.login.username}</span> would like to add deck: {target.name} to <span>{receiver.name}</span></p>
								<button onClick={acceptDeck}>Accept</button><button onClick={denyDeck}>Decline</button><button onClick={reviewDeck}>View</button>
								
							</div>
							:
							<div>
								<p onClick={expandMessage}><span>{read ? 'Read': 'Unread'}:</span><span>{sender.login.username}</span> would like to add deck: {target.name} to <span>{receiver.name}</span></p>
								<hr />
							</div>
						}
						</>
				);
			default:
				return null;
		}
	}

	const reviewDeck = () => {
		props.hideModal();
		navigate(`decks/${target._id}?review=true`);
	}

	useEffect(() => {
		if(!messageType) {
			axios.get(`${baseURL}/messages/${props.messageId}`)
				.then((response) => {
					let message = response.data;
					// setMessageType(message.type);
					setMessageType(message.__t);
					let s = message.sendingUser || message.sendingGroup;
					setSender(s);
					let r = message.targetGroup;
					setReceiver(r);
					let t = message.targetDeck || message.targetCard || message.targetGroup;
					setTarget(t);				
					//may not need conditional here	
					if(message.content) {
						setContent(message.content);
					}
					if(message.read.includes(userId)) {
						setRead(true);
					} else {
						setRead(false);
					}
					if(message.acceptanceStatus) {
						setAcceptanceStatus(message.acceptanceStatus);
					}
				})
				.catch(err => {
					console.log(err);
				});
		}
	}, [messageType, props.messageId]);
	
	return (
		<div>{renderMessage()}</div>
	)
}

Message.propTypes = {
	hideModal: PropTypes.func,
    messageId: PropTypes.string,
	expandMessage: PropTypes.func
}

export default Message
