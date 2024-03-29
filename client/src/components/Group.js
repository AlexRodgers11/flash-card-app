import React, { useEffect, useRef, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { deleteGroup, fetchGroupData } from '../reducers/groupSlice';
import { GroupMemberOptionsContainer, GroupWrapper, GroupNavbar, GroupTitle, OutletContainer, StyledLeaveButton, StyledNavLink } from './StyledComponents/GroupStyles';
import useToggle from '../hooks/useToggle';
import GroupMemberOption from './GroupMemberOption';
import { removeMember, replaceHeadAdmin } from '../reducers/groupSlice';
import { removeGroup } from '../reducers/loginSlice';
import Modal from './Modal';
import useFormInput from '../hooks/useFormInput';
import { fetchDecksOfUser } from '../reducers/decksSlice';
import { WarningButtonsWrapper, WarningMessage } from './StyledComponents/Warning';

function Group() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { groupId } = useParams();
    const userId = useSelector((state) => state.login.userId);
    const messageCount = useSelector((state) => state.communications.messages.received.length);
    const notificationCount = useSelector((state) => state.communications.notifications.length);
    const [modalContent, setModalContent] = useState("");
    const [groupDeletionInProgress, toggleGroupDeletionInProgress] = useToggle(false);
    const storedGroupId = useSelector((state) => state.group.groupId);
    const groupName = useSelector((state) => state.group.name)
    const groupMemberIds = useSelector((state) => state.group.memberIds);
    const administrators = useSelector((state) => state.group.administrators);
    const headAdmin = useSelector((state) => state.group.headAdmin);
    const [deleteConfirmation, clearDeleteConfirmation, handleChangeDeleteConfirmation] = useFormInput("");

    const firstRender = useRef(true);
    useEffect(() => {
        if(!firstRender.current) {
            dispatch(fetchGroupData({groupId}))
            .then(response => {
                if(response.meta.requestStatus !== "fulfilled") {
                    navigate("/dashboard");
                }
            });
        } else {
            firstRender.current = false;
        }
    }, [dispatch, groupId, userId, messageCount, navigate, notificationCount]);

    useEffect(() => {
        if(!storedGroupId || (storedGroupId !== groupId)) {
            if(groupDeletionInProgress) {
                navigate("/dashboard");
            } else {
                dispatch(fetchGroupData({groupId, userId})); 
            }
               
        }
    }, [dispatch, groupId, groupDeletionInProgress, navigate, storedGroupId, userId]);

    useEffect(() => {
        if((location.pathname.slice(32) !== "/decks" && location.pathname.slice(32) !== "/members") && location.pathname.slice(32) !== "/admin-controls") {
            navigate(`/groups/${groupId}/decks`);
        }
    }, [location.pathname, groupId, navigate]);

    const hideModal = () => {
        setModalContent("");
    }

    const handleSelectModalContent = (evt) => {
        setModalContent(evt.target.dataset.modalcontent);
    }

    const displayModalContent = () => {
        switch(modalContent) {
            case "leave-group-confirmation":
                return (
                    <div>
                        <WarningMessage>Are you sure you want to leave {groupName}?</WarningMessage>
                        <WarningButtonsWrapper>
                            <button className="btn btn-secondary" onClick={hideModal}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleLeaveGroup}>Yes, leave</button>
                        </WarningButtonsWrapper>
                    </div>
                );
            case "group-control-designation": 
                return (
                    <GroupMemberOptionsContainer className="GroupMemberOptionsContainer">
                        <p>Select a new Head Admin</p>
                        {groupMemberIds.slice(1).map(memberId => <div key={memberId} data-memberid={memberId} onClick={handleSelectNewHeadAdmin}><GroupMemberOption memberId={memberId} /></div>)}
                    </GroupMemberOptionsContainer>
                )
            case "head-admin-leave-group-confirmation":
                return (
                    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                        {groupMemberIds.length > 1 ? 
                            <>
                            <WarningMessage>Are you sure you want to leave {groupName}? You will need to select a member of the group to be a new Head Administrator</WarningMessage>
                            <WarningButtonsWrapper>
                                <button className="btn btn-secondary" onClick={hideModal} >Cancel</button>
                                <button className="btn btn-primary" data-modalcontent="group-control-designation" onClick={handleSelectModalContent}>Yes, choose a member</button>
                                <button className="btn btn-danger" data-modalcontent="delete-group-confirmation" onClick={handleSelectModalContent}>Delete Group Instead</button>
                            </WarningButtonsWrapper>
                            </>
                            :
                            <>
                            <WarningMessage>Since there are no other members leaving the group will cause the group to be deleted</WarningMessage>
                            <WarningButtonsWrapper>
                                <button className="btn btn-secondary" onClick={hideModal}>Cancel</button>
                                <button className="btn btn-danger" data-modalcontent="delete-group-confirmation" onClick={handleSelectModalContent}>Leave and Delete Group</button>
                            </WarningButtonsWrapper>
                            </>
                        }
                    </div>
                );
            case "delete-group-confirmation":
                return (
                    <form onSubmit={handleDeleteGroup}>
                        {/* <label className="form-label" htmlFor="confirm-delete-group">Type the group's name to delete. This action cannot be undone.</label> */}
                        <WarningMessage>Type the group's name to delete. This action cannot be undone.</WarningMessage>
                        <input className="form-control" id="confirm-delete-group" name="confirm-delete-group" type="text" onChange={handleChangeDeleteConfirmation} value={deleteConfirmation} />
                        <WarningButtonsWrapper>
                            <button className="btn btn-secondary" onClick={hideModal}>Cancel</button>
                            {deleteConfirmation === groupName && <button className="btn btn-danger" type="submit">Delete</button>}
                        </WarningButtonsWrapper>
                    </form>
                );
            default:
                return;
        }
    }

    const handleDeleteGroup = (evt) => {
        evt.preventDefault();
        toggleGroupDeletionInProgress();
        batch(() => {
            dispatch(deleteGroup({groupId, requesterId: userId}));
            dispatch(removeGroup({groupId}));
            dispatch(fetchDecksOfUser(userId));
        })
    }

    const handleLeaveGroup = () => {
        dispatch(removeMember({groupId, memberToRemoveId: userId, requesterId: userId}))
            .then((action) => {
                dispatch(removeGroup({groupId}));
                navigate("/dashboard");
            });
    }

    const handleSelectNewHeadAdmin = (evt) => {
        evt.preventDefault();
        batch(() => {
            dispatch(replaceHeadAdmin({groupId, newAdminId: evt.currentTarget.dataset.memberid}));
            dispatch(removeGroup({groupId}));
        });
        navigate("/dashboard");
    }


    if(groupDeletionInProgress) {
        return (
            <GroupWrapper>
                <p>Deleting Group</p>
            </GroupWrapper>
        )
    }

    return (
        <GroupWrapper className="GroupWrapper">
            <GroupNavbar>
                {administrators.includes(userId) && <StyledNavLink className={({isActive}) => isActive ? "active" : ""} to={`/groups/${groupId}/admin-controls`}>Admin Controls</StyledNavLink>}
                <StyledNavLink className={({isActive}) => isActive ? "active" : ""} to={`/groups/${groupId}/decks`}>Decks</StyledNavLink> 
                <StyledNavLink className={({isActive}) => isActive ? "active" : ""} to={`/groups/${groupId}/members`}>Members</StyledNavLink> 
            </GroupNavbar>
            <StyledLeaveButton className="btn btn-danger" data-modalcontent={userId === headAdmin ? "head-admin-leave-group-confirmation" : "leave-group-confirmation"} onClick={handleSelectModalContent}>Leave Group</StyledLeaveButton>
            {modalContent &&
                <Modal hideModal={hideModal}>
                    {displayModalContent()}
                </Modal>
            }
            <OutletContainer className="OutletContainer">
                <GroupTitle>{groupId === storedGroupId && groupName}</GroupTitle>
                <Outlet />
            </OutletContainer>
        </GroupWrapper>
    )
}

export default Group;