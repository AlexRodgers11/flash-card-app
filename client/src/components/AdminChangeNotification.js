import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { client } from '../utils';
import { useNavigate } from 'react-router';
import { NavigationSpan } from './StyledComponents/NavigationSpan';
import { NotificationContentContainer } from './StyledComponents/NotificationContentContainer';
import { useDispatch } from 'react-redux';
import { deleteNotification } from '../reducers/communicationsSlice';
import { FaTrashAlt } from 'react-icons/fa';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function AdminChangeNotification(props) {
	const navigate = useNavigate();
    const [group, setGroup] = useState();
	const [decidingUser, setDecidingUser] = useState();
    const [action, setAction] = useState();
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        if(loading) {
            (async () => {
                try {
                    const notificationRetrievalResponse = await client.get(`${baseURL}/notifications/${props.notificationId}?type=AdminChange`);
                    setGroup(notificationRetrievalResponse.data.targetGroup);
                    setDecidingUser(notificationRetrievalResponse.data.decidingUser);
                    setAction(notificationRetrievalResponse.data.action);
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
    
    const goToDecidingUserPage = () => {
        navigate(`/users/${decidingUser._id}`);
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
                <p><NavigationSpan onClick={decidingUser?._id && goToDecidingUserPage}>{decidingUser?.login?.username || (decidingUser?.name?.first && decidingUser?.name?.last ? `${decidingUser.name.first} ${decidingUser.name.last}` : "Deleted User")}</NavigationSpan> has {action === "grant" ? "added you to" : "removed you from"} the admins of group <NavigationSpan onClick={group?._id && goToGroupPage}>{group?.name || "Deleted Group"}</NavigationSpan></p>
                <FaTrashAlt role="button" onClick={handleDeleteNotification} />
            </NotificationContentContainer>
        );
    }
}

AdminChangeNotification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string,
}

export default AdminChangeNotification
