import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { client } from '../utils';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { NavigationSpan } from './StyledComponents/NavigationSpan';
import { NotificationContentContainer } from './StyledComponents/NotificationContentContainer';
import { deleteNotification } from '../reducers/communicationsSlice';
import { FaTrashAlt } from 'react-icons/fa';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function HeadAdminChangeNotification(props) {
    const userId = useSelector((state) => state.login.userId);
    const [group, setGroup] = useState();
    const [previousHeadAdmin, setPreviousHeadAdmin] = useState();
    const [newHeadAdmin, setNewHeadAdmin] = useState();
    const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
    const dispatch = useDispatch

    useEffect(() => {
        if(loading) {
            (async () => {
                try {
                    const notificationRetrievalResponse = await client.get(`${baseURL}/notifications/${props.notificationId}?type=HeadAdminChange`);
                    setGroup(notificationRetrievalResponse.data.targetGroup);
                    setPreviousHeadAdmin(notificationRetrievalResponse.data.previousHeadAdmin);
                    setNewHeadAdmin(notificationRetrievalResponse.data.newHeadAdmin);
                    setLoading(false);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    }, [loading, props.notificationId]);

    const handleDeleteNotification = () => {
		dispatch(deleteNotification({notificationId: props.notificationId}));
	}

    const goToPreviousHeadAdminPage = () => {
        navigate(`/users/${previousHeadAdmin._id}`);
        props.hideModal();
    }

    const goToNewHeadAdminPage = () => {
        navigate(`/users/${newHeadAdmin._id}`);
        props.hideModal();
    }

    const goToGroupPage = () => {
        navigate(`/groups/${group._id}`);
        props.hideModal();
    }
	
    if(loading) {
        return <>Loading</>
    } else {
        return (
            <NotificationContentContainer>
                {newHeadAdmin._id === userId ?
                    <p><NavigationSpan onClick={previousHeadAdmin?.name ? goToPreviousHeadAdminPage : null}>{previousHeadAdmin?.login?.username || (previousHeadAdmin?.name?.first && previousHeadAdmin?.name?.last ? `${previousHeadAdmin.name.first} ${previousHeadAdmin.name.last}` : "deleted user")}</NavigationSpan> has made you the new head admin of group <NavigationSpan onClick={group?.name ? goToGroupPage : null}>{group?.name || "deleted group"}</NavigationSpan></p>
                    :
                    <p>
                        Group <NavigationSpan onClick={group?.name ? goToGroupPage : null}>{group?.name || "deleted group"}</NavigationSpan> has a new head admin, <NavigationSpan onClick={newHeadAdmin?.name ? goToNewHeadAdminPage : null}>{newHeadAdmin?.login?.username || (newHeadAdmin?.name?.first && newHeadAdmin?.name?.last ? `${newHeadAdmin.name.first} ${newHeadAdmin.name.last}` : "deleted user")}</NavigationSpan>
                    </p>
                }
                <FaTrashAlt role="button" onClick={handleDeleteNotification} />
            </NotificationContentContainer>
        );
    }
}

HeadAdminChangeNotification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string,
}

export default HeadAdminChangeNotification
