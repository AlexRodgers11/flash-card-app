import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import Notification from './Notification';

function NotificationList(props) {
	const notifications = useSelector((state) => state.login.notifications);
	return (
		<div>{notifications.map(notificationId => <Notification notificationId={notificationId} hideModal={props.hideModal}/>)}</div>
	)
}

NotificationList.propTypes = {
	hideModal: PropTypes.func
}

export default NotificationList
