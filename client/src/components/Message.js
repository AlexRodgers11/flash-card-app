import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { addDeck } from '../reducers/decksSlice';
import { addActivity } from '../reducers/groupSlice';

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

	const acceptDeck = () => {
		axios.post(`${baseURL}/groups/${receiver._id}/decks?accepted=true`, {idOfDeckToCopy: target._id})//see if adding userId here worked
			.then((deckPostResponse) => {
				let notification = {
					type: 'deck-approved',
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
				 })
				 .catch(notificationErr => {
					console.error(notificationErr);
				 });
			})
			.catch(deckAddErr => {
				console.error(deckAddErr);
			});
	}
	
	const expandMessage = () => {
		props.expandMessage(props.messageId);
	}
	
	const renderMessage = () => {
		switch(messageType) {
			case '':
				return null;
			case 'add-deck-request':
				return (
						<>
						{props.fullView ? 
							<div>
								<p><span>{sender.login.username}</span> would like to add deck: {target.name} to <span>{receiver.name}</span></p>
								<button onClick={acceptDeck}>Accept</button><button>Decline</button><button onClick={reviewDeck}>View</button>
								
							</div>
							:
							<div>
								<p onClick={expandMessage}><span>{sender.login.username}</span> would like to add deck: {target.name} to <span>{receiver.name}</span></p>
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
					setMessageType(message.type);
					let s = message.sendingUser || message.sendingGroup;
					setSender(s);
					let r = message.targetGroup;
					setReceiver(r);
					let t = message.targetDeck || message.targetCard || message.targetGroup;
					setTarget(t);					
					if(message.content) {
						setContent(message.content);
					}
					setRead(message.read);
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
