import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import Notification from './Notification';

function NotificationList(props) {
	const notifications = useSelector((state) => state.communications.notifications);
	return (
		<div>{notifications.map(notification => <Notification notificationId={notification._id} hideModal={props.hideModal}/>)}</div>
	)
}

NotificationList.propTypes = {
	hideModal: PropTypes.func
}

export default NotificationList
