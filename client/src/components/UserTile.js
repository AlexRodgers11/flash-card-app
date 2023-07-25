import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { HiOutlineUserCircle } from "react-icons/hi";
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

const TitleWrapper = styled.div`
    height: 1.25rem;
    font-weight: 600;
`;

const Button = styled.button`
    font-size: .65rem;
    white-space: normal;
    word-wrap: break-word;
    max-width: 5.5rem;
    display: block;
    margin-bottom: .15rem;
    padding: .125rem .25rem;
`;

const EditOptionsWrapper = styled.div`
`;

const IconContainer = styled.div`
    position: relative;
    display: inline-block;
    // margin-top: .15rem;
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
    border: 2px solid black;
`;

const InitialsCircle = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    background-color: #008CBA;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    border: 2px solid black;
`;

const StyledImage = styled.img`
    // display: block;
    position: relative;
    top: 0;

    width: 100%;
    height: 100%;////might not be doing anything
    object-fit: cover;
    border: 2px solid black;
    border-radius: 50%;
`;

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function UserTile(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { groupId } = useParams();
    const loggedInUserId = useSelector((state) => state.login.userId);
    const [userData, setUserData] = useState({});
    const headAdmin = useSelector((state) => state.group.headAdmin);
    const administrators = useSelector((state) => state.group.administrators);
    

    useEffect(() => {
        setTimeout(() => {
            axios.get(`${baseURL}/users/${props.memberId}/identification`)
                .then((response) => setUserData(response.data));
        }, 0)
    }, [props.memberId]);

    const viewUser = evt => {
        evt.preventDefault();
        navigate(`/users/${props.memberId}`);
    }

    const handleRemoveMember = () => {
        dispatch(removeMember({groupId, memberToRemoveId: props.memberId}));
    }
    const addMemberToAdmins = () => {
        dispatch(grantAdminAuthority({groupId, memberToAuthorizeId: props.memberId}));
    }

    const removeMemberFromAdmins = () => {
        dispatch(revokeAdminAuthority({groupId, memberToDeauthorizeId: props.memberId}));
    }

    const handleViewOnEnter = (evt) => {
        if(evt.keyCode === 13) {
            navigate(`/users/${props.memberId}`);        
        }
    }

    if(!userData.firstName) {
        return;
    }
    
    return (
        <UserTileWrapper className="UserTileWrapper" editMode={props.editMode} tabIndex={0} role="button" onKeyDown={props.editMode ? null : handleViewOnEnter} onClick={props.editMode ? null : viewUser}>
            {(props.editMode && (loggedInUserId !== props.memberId && headAdmin !== props.memberId)) ?
                <EditOptionsWrapper className="EditOptionsWrapper">
                    {(((props.listType==="members") && props.memberId !== headAdmin) && (loggedInUserId === headAdmin || !props.isAdmin)) && <Button className="btn btn-danger" onClick={handleRemoveMember}>Remove From Group</Button>}
                    {(!props.isAdmin && props.listType==="members") && <Button className="btn btn-primary" onClick={addMemberToAdmins}>Make Administrator</Button>}
                    {(loggedInUserId === headAdmin && props.isAdmin) && <Button className="btn btn-danger" onClick={removeMemberFromAdmins}>Remove From Administrators</Button>}
                    {administrators.slice(1).includes(loggedInUserId) && <TitleWrapper>{props.memberId === headAdmin ? "Head Admin" : props.isAdmin ? "Admin" : ""}</TitleWrapper>}
                </EditOptionsWrapper>
                :
                <TitleWrapper>{props.memberId === headAdmin ? "Head Admin" : props.isAdmin ? "Admin" : ""}</TitleWrapper>
            }
            <IconContainer>
                {userData.photo ?
                    <>
                        <StyledImage className="StyledImage" src={userData.photo} alt="profile-icon" /> 
                        <InitialsOverlay className="initials-overlay">{`${userData.firstName[0]}.${userData.lastName[0]}.`}</InitialsOverlay>
                    </>
                    :
                    <InitialsCircle>{`${userData.firstName[0]}.${userData.lastName[0]}.`}</InitialsCircle>
                }
            </IconContainer>
        </UserTileWrapper>
    )
}


export default UserTile

