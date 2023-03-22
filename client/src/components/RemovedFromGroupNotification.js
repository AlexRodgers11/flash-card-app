import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { client } from '../utils';
import { useNavigate } from 'react-router';
import { NavigationSpan } from './StyledComponents/NavigationSpan';
import { NotificationContentContainer } from './StyledComponents/NotificationContentContainer';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function RemovedFromGroupNotification(props) {
    const [groupName, setGroupName] = useState();
    const [decidingUser, setDecidingUser] = useState();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if(loading) {
            (async () => {
                try {
                    const notificationRetrievalResponse = await client.get(`${baseURL}/notifications/${props.notificationId}?type=RemovedFromGroup`);
                    console.log({data: notificationRetrievalResponse.data});
                    setGroupName(notificationRetrievalResponse.data.targetGroup?.name);
                    setDecidingUser(notificationRetrievalResponse.data.decidingUser);
                    setLoading(false);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    }, [loading, props.notificationId]);

    const goToDecidingUserPage = () => {
        navigate(`/users/${decidingUser._id}`);
        props.hideModal();
    }
	
    if(loading) {
        return <>Loading</>
    } else {
        return (
            <NotificationContentContainer>
                <p><NavigationSpan onClick={decidingUser?._id && goToDecidingUserPage}>{decidingUser?.login?.username || (decidingUser?.name?.first && decidingUser?.name?.last ? `${decidingUser.name.first} ${decidingUser.name.last}` : "Deleted User")}</NavigationSpan> has removed you from group {groupName || "Deleted Group"}</p>
            </NotificationContentContainer>
        );
    }
}

RemovedFromGroupNotification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string,
}

export default RemovedFromGroupNotification
