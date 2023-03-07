import React from "react"
import { useDispatch } from "react-redux";
import PropTypes from "prop-types"
import NewMemberJoinedNotification from "./NewMemberJoinedNotification";
import DeckAddedNotification from "./DeckAddedNotification";
import AdminChangeNotification from "./AdminChangeNotification";
import RemovedFromGroupNotification from "./RemovedFromGroupNotification";
import GroupDeletedNotification from "./GroupDeletedNotification";
import HeadAdminChangeNotification from "./HeadAdminChangeNotification";
import { FaTrashAlt } from "react-icons/fa";
import { deleteNotification } from "../reducers/communicationsSlice";
import styled from "styled-components";

const NotificationWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	text-align: left;
	padding: .75rem 1.25rem;
	border: 1px solid black;
	border-bottom: none;
	&:last-of-type {
		border-bottom: 1px solid black;
	}
`;


function Notification(props) {
	const dispatch = useDispatch();

	const handleDeleteNotification = () => {
		dispatch(deleteNotification({notificationId: props.notificationId}));
	}

	const renderNotification = () => {
		switch(props.notificationType) {
			case "NewMemberJoined": 
				return <NewMemberJoinedNotification hideModal={props.hideModal} notificationId={props.notificationId} />
			case "DeckAdded":
				return <DeckAddedNotification hideModal={props.hideModal} notificationId={props.notificationId} />
			case "AdminChange":
				return <AdminChangeNotification hideModal={props.hideModal} notificationId={props.notificationId}/>
			case "RemovedFromGroup":
				return <RemovedFromGroupNotification hideModal={props.hideModal} notificationId={props.notificationId} />
			case "GroupDeleted": 
				return <GroupDeletedNotification hideModal={props.hideModal} notificationId={props.notificationId} />
			case "HeadAdminChange":
				return <HeadAdminChangeNotification hideModal={props.hideModal} notificationId={props.notificationId} />
			default:
				return null
		}
	}

	return (
		<NotificationWrapper>
			{renderNotification()}
			<FaTrashAlt role="button" onClick={handleDeleteNotification} />
		</NotificationWrapper>
	)
}

Notification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string
}

export default Notification
