import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { useNavigate } from 'react-router';
import { NavigationSpan } from './StyledComponents/NavigationSpan';

const baseURL = 'http://localhost:8000';

function AdminChangeNotification(props) {
	const navigate = useNavigate();
    const [group, setGroup] = useState();
	const [decidingUser, setDecidingUser] = useState();
    const [action, setAction] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(loading) {
            console.log("No action");
            (async () => {
                try {
                    console.log("in try block");
                    const notificationRetrievalResponse = await axios.get(`${baseURL}/notifications/${props.notificationId}?type=AdminChange`);
                    console.log({data:notificationRetrievalResponse.data});
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
            <div>
                <p><NavigationSpan onClick={decidingUser?._id && goToDecidingUserPage}>{decidingUser?.login?.username || (decidingUser?.name?.first && decidingUser?.name?.last ? `${decidingUser.name.first} ${decidingUser.name.last}` : "Deleted User")}</NavigationSpan> has {action === "grant" ? "added you to" : "removed you from"} the admins of group <NavigationSpan onClick={group?._id && goToGroupPage}>{group?.name || "Deleted Group"}</NavigationSpan></p>
                <hr />
            </div>
        );
    }
}

AdminChangeNotification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string,
}

export default AdminChangeNotification
