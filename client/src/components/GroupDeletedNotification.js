import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';

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
        return <>Loading</>
    } else {
        return (
            <div>
                <p>Group {groupName} has been deleted</p>
                <hr />
            </div>
        );
    }
}

GroupDeletedNotification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string,
}

export default GroupDeletedNotification
