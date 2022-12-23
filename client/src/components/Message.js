import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { addDeck } from '../reducers/decksSlice';
import { addActivity, addMember } from '../reducers/groupSlice';
import { editMessage, makeApprovalDecision, markMessageAsRead } from '../reducers/loginSlice';
import useFormInput from '../hooks/useFormInput';

const baseURL = 'http://localhost:8000';

function Message(props) {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const userId = useSelector((state) => state.login.userId);
	const deckListType = useSelector((state) => state.decks.listType);
	const [messageType, setMessageType] = useState('');
	const [sender, setSender] = useState({});
	const [receiver, setReceiver] = useState({});
	const [target, setTarget] = useState({});
	const [content, setContent] = useState('');
	const [read, setRead] = useState(false);
	const [acceptanceStatus, setAcceptanceStatus] = useState('');
	const [comment, clearComment, handleChangeComment, setComment] = useFormInput('');

	//may need to change this to just accept so card acceptance is same, and then choose route conditionally

	const acceptDeck = () => {
		console.log("acceptDeck running");
		if(acceptanceStatus === "pending") {
			//change this so that decision takes value of data property on the button so can use same function for accept/deny
			dispatch(makeApprovalDecision({messageId: props.messageId, decision: "approved", comment, messageType, responseMessageType: "DeckDecision", decidingUserId: userId}))
				.then((actionPayload) => {
					console.log({actionPayload});
					props.hideModal();//possibly better to go back to inbox instead
					clearComment();
					//if user is already on group page need this so that the page refreshes to show new deck and new activity
					if(deckListType === 'group') {
						dispatch(addDeck({deckId: actionPayload.newDeck}));
						dispatch(addActivity({activityId: actionPayload.newActivity, groupId: receiver._id}));
					}
				});		
		} else {
			alert(`This deck has already been ${acceptanceStatus}`);//need to change acceptance status in this function
		}
	}

	const denyDeck = () => {
		if(acceptanceStatus === 'pending') {
			axios.patch(`${baseURL}/messages/${props.messageId}`, {acceptanceStatus: 'denied', messageType: 'DeckSubmission'})
			.catch(err => {
				console.error(err)
			})
			.then(acceptanceResponse => {
				let notification = {
					// type: 'DeckDecision',
					notificationType: 'DeckDecision',
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

	const acceptUser = () => {
		if(acceptanceStatus === 'pending') {
			axios.patch(`${baseURL}/messages/${props.messageId}`, {acceptanceStatus: 'approved', messageType: 'JoinRequest'})
			.catch(err => {
				console.error(err);
			})
			.then(acceptanceResponse => {
				axios.post(`${baseURL}/groups/${receiver._id}/members/request`, {newMember: sender._id, adminId: userId})
				.catch(addMemberErr => {
					console.error(addMemberErr);
				})
				.then(memberPostResponse => {
					let notification = {
						notificationType: 'JoinDecision', 
						decision: 'approved',
						read: false,
						actor: userId,
						groupTarget: receiver._id,
					}
					axios.post(`${baseURL}/users/${sender._id}/notifications`, notification)
					.catch(notificationPostErr => {
						console.error(notificationPostErr);
					})
					.then(() => {
						props.hideModal();
						if(deckListType === 'group') {
							dispatch(addMember({groupId: receiver._id, userId: memberPostResponse.data}));
							//add logic to add activity here, probably refactor activity to use discriminators first
						} 
						dispatch(editMessage({direction: 'sent', message: acceptanceResponse.data}));
					});
				})
				.catch(notificationErr => {
					console.error(notificationErr);
				})
			})
		} else {
			alert("User has already been added to the group");
		}
	}
	
	const denyUser = () => {
		if(acceptanceStatus === 'pending') {
			axios.patch(`${baseURL}/messages/${props.messageId}`, {acceptanceStatus: 'denied', messageType: 'JoinRequest'})
			.catch(err => {
				console.error(err);
			})
			.then(acceptanceResponse => {
				let notification = {
					notificationType: 'JoinDecision', 
					decision: 'denied',
					read: false,
					actor: userId,
					groupTarget: receiver._id,
					
				}
				axios.post(`${baseURL}/users/${sender._id}/notifications`, notification)
					.catch(notificationPostErr => {
						console.error(notificationPostErr);
					})
					.then(() => {
						props.hideModal();
						dispatch(editMessage({direction: 'sent', message: acceptanceResponse.data}));
					});
			})
			.catch(notificationErr => {
				console.error(notificationErr);
			})
		} else {
			alert(`User's request to join has already been ${acceptanceStatus}`);
		}
	}
	
	const expandMessage = () => {
		props.expandMessage(props.messageId);
		if(!read) {
			dispatch(markMessageAsRead({messageId: props.messageId, direction: props.direction, readerId: userId}));
		}
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
								{userId !== sender._id && <><button onClick={acceptDeck}>Accept</button><button onClick={denyDeck}>Decline</button><button onClick={reviewDeck}>View</button></>}
								
							</div>
							:
							<div>
								<p onClick={expandMessage}><span>{read ? 'Read': 'Unread'}:</span><span>{sender.login.username}</span> would like to add deck: {target.name} to <span>{receiver.name}</span></p>
								<hr />
							</div>
						}
						</>
				);
			case 'DeckDecision':
				return (
					<>
					{props.fullView ? 
						<div>
							<p><span>{sender.login.username}</span> {acceptanceStatus} your request to add deck: {target.name} to <span>{receiver.name}</span></p>
							{comment && <p>{sender.login.username} left this comment: "{comment}"</p>}
						</div>
						:
						<div>
							<p onClick={expandMessage}><span>{sender.login.username}</span> {acceptanceStatus} your request to add deck: {target.name} to <span>{receiver.name}</span></p>
							<hr />
						</div>
					}
					</>
				);
			case 'JoinRequest':
				return (
					<>
					{props.fullView ? 
						<div>
							<p><span>{sender.login.username}</span> would like to join: {target.name}</p>
							{userId !== sender._id && <><button onClick={acceptUser}>Accept</button><button onClick={denyUser}>Decline</button><button onClick={reviewUser}>View</button></>}
						</div>
						:
						<div>
							<p onClick={expandMessage}><span>{read ? 'Read': 'Unread'}:</span><span>{sender.login.username}</span> would like to to join<span>{receiver.name}</span></p>
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

	const reviewUser = () => {
		props.hideModal();
		navigate(`users/${sender._id}?review=true`);
	}

	useEffect(() => {
		if(!messageType) {
			axios.get(`${baseURL}/messages/${props.messageId}`)
				.then((response) => {
					let message = response.data;
					// setMessageType(message.type);
					// setMessageType(message.__t);
					setMessageType(message.message);
					// setMessageType(message.messageType);
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
					if(message.comment) {
						setComment(message.comment);
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
