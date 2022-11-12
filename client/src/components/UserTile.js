import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { grantAdminAuthority, removeMember, revokeAdminAuthority } from '../reducers/groupSlice';

function UserTile(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { groupId } = useParams();
    const loggedInUserId = useSelector((state) => state.login.userId);
    const [userData, setUserData] = useState({});
    const headAdmin = useSelector((state) => state.group.headAdmin);

    useEffect(() => {
        const baseURL = 'http://localhost:8000';
        axios.get(`${baseURL}/users/${props.memberId}/tile`)
            .then((response) => setUserData(response.data));
    }, [props.memberId]);

    const viewUser = evt => {
        evt.preventDefault();
        navigate(`/users/${props.memberId}`);
    }

    const handleRemoveMember = () => {
        dispatch(removeMember({groupId, memberToRemoveId: props.memberId, requesterId: loggedInUserId}));
        //be sure to create notification to let member know what happened
    }

    const addMemberToAdmins = () => {
        dispatch(grantAdminAuthority({groupId, memberToAuthorizeId: props.memberId, requesterId: loggedInUserId}));
        //need to make notification
    }

    const removeMemberFromAdmins = () => {
        dispatch(revokeAdminAuthority({groupId, memberToDeauthorizeId: props.memberId, requesterId: loggedInUserId}));
        //need to make notification
    }

    return (
        <div onClick={props.editMode ? null : viewUser} style={{border: "1px solid black", display: "inline-block", margin: "1em", padding: "1em"}}>
            {(props.editMode && loggedInUserId !== props.memberId) &&
                <div>
                    {(((props.listType==="members") && props.memberId !== headAdmin) && (loggedInUserId === headAdmin || !props.isAdmin)) && <button onClick={handleRemoveMember}>Remove</button>}
                    {(!props.isAdmin && props.listType==="members") && <button onClick={addMemberToAdmins}>Make Administrator</button>}
                    {(loggedInUserId === headAdmin && props.listType==="admins") && <button onClick={removeMemberFromAdmins}>Remove From Administrators</button>}
                </div>
            }
            <h1>{userData.login?.username}</h1>
            <h2>{userData.firstName} {userData.lastName}</h2>
            <p>{userData.login?.email}</p>
            <p>{userData.photo}</p>
        </div>
    )
}

UserTile.propTypes = {
    userId: PropTypes.string,
    editMode: PropTypes.bool
}

export default UserTile
