import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const baseURL = 'http://localhost:8000';

const NavigationSpan = styled.span`
    font-weight: 600;
    cursor: pointer;
`;

function HeadAdminChangeNotification(props) {
    const userId = useSelector((state) => state.login.userId);
    const [group, setGroup] = useState();
    const [previousHeadAdmin, setpreviousHeadAdmin] = useState();
    const [newHeadAdmin, setNewHeadAdmin] = useState();
    const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

    useEffect(() => {
        if(loading) {
            console.log("No action");
            (async () => {
                try {
                    console.log("in try block");
                    const notificationRetrievalResponse = await axios.get(`${baseURL}/notifications/${props.notificationId}?type=HeadAdminChange`);
                    console.log({data:notificationRetrievalResponse.data});
                    setGroup(notificationRetrievalResponse.data.targetGroup);
                    setpreviousHeadAdmin(notificationRetrievalResponse.data.previousHeadAdmin);
                    setNewHeadAdmin(notificationRetrievalResponse.data.newHeadAdmin);
                    setLoading(false);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    }, [loading, props.notificationId]);


    const goTopreviousHeadAdminPage = () => {
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
            <div>
                {newHeadAdmin._id === userId ?
                    <p><NavigationSpan onClick={previousHeadAdmin?.name ? goTopreviousHeadAdminPage : null}>{previousHeadAdmin?.login?.username || (previousHeadAdmin?.name?.first && previousHeadAdmin?.name?.last ? `${previousHeadAdmin.name.first} ${previousHeadAdmin.name.last}` : "deleted user")}</NavigationSpan> has made you the new head admin of group <NavigationSpan onClick={group?.name ? goToGroupPage : null}>{group.name || "deleted group"}</NavigationSpan></p>
                    :
                    <p>
                        Group <NavigationSpan onClick={group?.name ? goToGroupPage : null}>{group.name || "deleted group"}</NavigationSpan> has a new head admin, <NavigationSpan onClick={newHeadAdmin?.name ? goToNewHeadAdminPage : null}>{newHeadAdmin?.login?.username || (newHeadAdmin?.name?.first && newHeadAdmin?.name?.last ? `${newHeadAdmin.name.first} ${newHeadAdmin.name.last}` : "deleted user")}</NavigationSpan>
                    </p>
                }
                <hr />
            </div>
        );
    }
}

HeadAdminChangeNotification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string,
}

export default HeadAdminChangeNotification
