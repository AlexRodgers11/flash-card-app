import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { useNavigate } from 'react-router';

const baseURL = 'http://localhost:8000';

function Notification(props) {
	const navigate = useNavigate();
	const [notification, setNotification] = useState({});

	useEffect(() => {
		if(!notification.type) {
			axios.get(`${baseURL}/notifications/${props.notificationId}`)
				.then((response) => {
					setNotification(response.data);
				})
		}
	}, [notification, props.notificationId]);

	const handleClick = () => {
		//make sure hiding Modal and thus destroying component chain won't short circuit navigation call if using React 18's concurrency
		props.hideModal();
		switch(notification.type) {
			case 'deck-approved':
				navigate(`/groups/${notification.groupTarget}`);
				break;
			default:
				break;
		}
	}
	
	const renderNotification = () => {
		switch(notification.type) {
			case 'deck-approved':
				return <p onClick={handleClick}>{notification.actor.username} approved your request to add deck {notification.deckTarget.name} to {notification.groupTarget.name}</p>
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
