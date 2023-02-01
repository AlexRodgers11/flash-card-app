import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

const baseURL = 'http://localhost:8000';

const NavigationSpan = styled.span`
    font-weight: 600;
    cursor: pointer;
`;

function RemovedFromGroupNotification(props) {
    const [groupName, setGroupName] = useState();
    const [decidingUser, setDecidingUser] = useState();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if(loading) {
            console.log("loading");
            (async () => {
                try {
                    const notificationRetrievalResponse = await axios.get(`${baseURL}/notifications/${props.notificationId}?type=RemovedFromGroup`);
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
            <div>
                <p><NavigationSpan onClick={decidingUser?._id && goToDecidingUserPage}>{decidingUser?.login?.username || (decidingUser?.name?.first && decidingUser?.name?.last ? `${decidingUser.name.first} ${decidingUser.name.last}` : "Deleted User")}</NavigationSpan> has removed you from group {groupName || "Deleted Group"}</p>
                <hr />
            </div>
        );
    }
}

RemovedFromGroupNotification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string,
}

export default RemovedFromGroupNotification
