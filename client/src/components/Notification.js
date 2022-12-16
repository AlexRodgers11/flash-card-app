import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { useNavigate } from 'react-router';

const baseURL = 'http://localhost:8000';

function Notification(props) {
	const navigate = useNavigate();
	const [notification, setNotification] = useState({});

	useEffect(() => {
		if(!notification.notificationType) {
			axios.get(`${baseURL}/notifications/${props.notificationId}`)
				.then((response) => {
					setNotification(response.data);
				})
		}
	}, [notification, props.notificationId]);

	const handleClick = () => {
		//make sure hiding Modal and thus destroying component chain won't short circuit navigation call if using React 18's concurrency
		props.hideModal();
		switch(notification.notificationType) {
			// case 'deck-approved':
			case 'DeckSubmission':
				// if(notification.decision === 'accepted') {
				if(notification.decision === 'approved') {
					navigate(`/groups/${notification.groupTarget._id}`);
				}
				break;
			default:
				break;
		}
	}
	
	const renderNotification = () => {
		switch(notification.notificationType) {
			case 'DeckDecision':
				return <p onClick={handleClick}>{notification.actor.login.username} {notification.decision} your request to add deck {notification.deckTarget.name} to {notification.groupTarget.name}</p>
			// case 'deck-approved':
			// 	return <p onClick={handleClick}>{notification.actor.login.username} approved your request to add deck {notification.deckTarget.name} to {notification.groupTarget.name}</p>
			// case 'deck-denied':
			// 	return <p onClick={handleClick}>{notification.actor.login.username} denied your request to add deck {notification.deckTarget.name} to {notification.groupTarget.name}</p>
			default:
				return null
		}
	}

	return (
		<div>{renderNotification()}</div>
	)
}

Notification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string
}

export default Notification
