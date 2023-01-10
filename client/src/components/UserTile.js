import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { useNavigate, useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { grantAdminAuthority, removeMember, revokeAdminAuthority } from '../reducers/groupSlice';
import styled from 'styled-components';

const UserTileWrapper = styled.div`    
    display: inline-flex; 
    flex-direction: column;    
    text-align: center;  
    justify-content: center;
    align-items: center;
    position: relative;
    margin: 1rem;
    height: ${props => !props.editMode ? "8rem" : "12rem"};
    width: 6rem; 
`;
const Button = styled.button`
    font-size: .65rem;
    white-space: normal;
    word-wrap: break-word;
    max-width: 5.5rem;
    display: block;
`;

const EditOptionsWrapper = styled.div`
`;

const ImageContainer = styled.div`
    position: relative;
    display: inline-block;
    margin-top: .15rem;
    border-radius: 50%;
    overflow: hidden;
    width: 6rem;
    height: 6rem;

    &:hover .initials-overlay {
        opacity: 1;
    }
`

const InitialsOverlay = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    opacity: 0;
    transition: .25s ease;
    background-color: #008CBA;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
`;

const StyledImage = styled.img`
    // display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

function UserTile(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { groupId } = useParams();
    const loggedInUserId = useSelector((state) => state.login.userId);
    const [userData, setUserData] = useState({});
    const headAdmin = useSelector((state) => state.group.headAdmin);
    
    const baseURL = 'http://localhost:8000';

    useEffect(() => {
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

    const handleViewOnEnter = (evt) => {
        if(evt.keyCode === 13) {
            navigate(`/users/${props.memberId}`);        
        }
    }

    return (
        <UserTileWrapper className="UserTileWrapper" editMode={props.editMode} tabIndex={0} role="button" onKeyDown={props.editMode ? null : handleViewOnEnter} onClick={props.editMode ? null : viewUser}>
            {(props.editMode && loggedInUserId !== props.memberId) ?
                <EditOptionsWrapper className="EditOptionsWrapper">
                    {(((props.listType==="members") && props.memberId !== headAdmin) && (loggedInUserId === headAdmin || !props.isAdmin)) && <Button onClick={handleRemoveMember}>Remove From Group</Button>}
                    {(!props.isAdmin && props.listType==="members") && <Button onClick={addMemberToAdmins}>Make Administrator</Button>}
                    {(loggedInUserId === headAdmin && props.isAdmin) && <Button onClick={removeMemberFromAdmins}>Remove From Administrators</Button>}
                </EditOptionsWrapper>
                :
                <p>{props.memberId === headAdmin ? "Head Admin" : props.isAdmin ? "Admin" : ""}</p>
            }
            {userData.photo ? 
                <ImageContainer className="ImageContainer">
                    <StyledImage className="StyledImage" src={userData.photo} alt="profile-icon" /> 
                    <InitialsOverlay className="initials-overlay">{`${userData.firstName[0]}.${userData.lastName[0]}.`}</InitialsOverlay>
                </ImageContainer>
                : 
                <div style={{display: "inline-block", border: "1.5px solid black", borderRadius: "50%", width: "65%"}}>{`${userData.firstName && userData.firstName[0]}.${userData.lastName && userData.lastName[0]}.`}</div> 
            }
        </UserTileWrapper>
    )
}


export default UserTile

