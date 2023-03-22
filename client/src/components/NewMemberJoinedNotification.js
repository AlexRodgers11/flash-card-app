import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { client } from '../utils';
import { useNavigate } from 'react-router';
import { NavigationSpan } from './StyledComponents/NavigationSpan';
import { NotificationContentContainer } from './StyledComponents/NotificationContentContainer';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';


function NewMemberJoinedNotification(props) {
	const navigate = useNavigate();
	const [newMember, setNewMember] = useState();
    const [group, setGroup] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(loading) {
            (async () => {
                try {
                    const notificationRetrievalResponse = await client.get(`${baseURL}/notifications/${props.notificationId}?type=NewMemberJoined`);
                    setNewMember(notificationRetrievalResponse.data.member);
                    setGroup(notificationRetrievalResponse.data.targetGroup);
                    setLoading(false);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    }, [loading, props.notificationId]);


    const goToNewMemberPage = () => {
        navigate(`/users/${newMember._id}`);
        props.hideModal();
    }

    const goToGroupPage = () => {
        navigate(`/groups/${group._id}`);
        props.hideModal();
    }
	
    if(loading) {
        return <></>
    } else {
        return (
            <NotificationContentContainer>
                <p><NavigationSpan onClick={newMember?._id && goToNewMemberPage}>{newMember?.login?.username || (newMember?.name?.first && newMember?.name?.last ? `${newMember.name.first} ${newMember.name.last}` : "Deleted User")}</NavigationSpan> joined group <NavigationSpan onClick={group?._id && goToGroupPage}>{group?.name || "Deleted Group"}</NavigationSpan></p>
            </NotificationContentContainer>
        );
    }
}

NewMemberJoinedNotification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string,
}

export default NewMemberJoinedNotification
