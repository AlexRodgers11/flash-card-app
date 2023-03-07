import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { NotificationContentContainer } from './StyledComponents/NotificationContentContainer';

const baseURL = 'http://localhost:8000';

function GroupDeletedNotification(props) {
    const [groupName, setGroupName] = useState();

    useEffect(() => {
        if(!groupName) {
            (async () => {
                try {
                    const notificationRetrievalResponse = await axios.get(`${baseURL}/notifications/${props.notificationId}?type=GroupDeleted`);
                    setGroupName(notificationRetrievalResponse.data.groupName);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    }, [groupName, props.notificationId]);
	
    if(!groupName) {
        return <></>
    } else {
        return (
            <NotificationContentContainer>
                <p>Group {groupName} has been deleted</p>
            </NotificationContentContainer>
        );
    }
}

GroupDeletedNotification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string,
}

export default GroupDeletedNotification
