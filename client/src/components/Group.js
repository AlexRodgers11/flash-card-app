import React, { useEffect, useRef, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { fetchGroupData } from '../reducers/groupSlice';
import { GroupMemberOptionsContainer, GroupWrapper, GroupNavbar, GroupTitle, OutletContainer, StyledLeaveButton, StyledNavLink } from './GroupStyles';
import useToggle from '../hooks/useToggle';
import GroupMemberOption from './GroupMemberOption';
import { removeMember, replaceHeadAdmin } from '../reducers/groupSlice';
import { removeGroup } from '../reducers/loginSlice';
import Modal from './Modal';

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
        console.log("should be selecting modal content");
        setModalContent(evt.target.dataset.modalcontent);
    }

    const displayModalContent = () => {
        switch(modalContent) {
            case "leave-group-confirmation":
                return (
                    <div>
                        <p>Are you sure you want to leave {groupName}?</p>
                        <button onClick={handleLeaveGroup}>Yes, leave</button>
                        <button onClick={hideModal}>Cancel</button>
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
                    <div>
                        {groupMemberIds.length > 1 ? 
                            <>
                            <p>Are you sure you want to leave {groupName}? You will need to select a member of the group to be a new Head Administrator</p>
                            <button data-modalcontent="group-control-designation" onClick={handleSelectModalContent}>Yes, choose a member</button>
                            <button data-modalcontent="delete-group-confirmation" onClick={handleSelectModalContent}>Delete Group Instead</button>
                            </>
                            :
                            <>
                            <p>Since there are no other members leaving the group will cause the group to be deleted</p>
                            <button data-modalcontent="delete-group-confirmation" onClick={handleSelectModalContent}>Leave and Delete Group</button>
                            </>
                        }
                        <button onClick={hideModal}>Cancel</button>
                    </div>
                );
            default:
                return;
        }
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
        return (<p>Deleting Group</p>)
    }

    return (
        <GroupWrapper className="GroupWrapper">
            <GroupNavbar>
                {administrators.includes(userId) && <StyledNavLink to={`/groups/${groupId}/admin-controls`}>Admin Controls</StyledNavLink>}
                <StyledNavLink to={`/groups/${groupId}/decks`}>Decks</StyledNavLink> 
                <StyledNavLink to={`/groups/${groupId}/members`}>Members</StyledNavLink> 
            </GroupNavbar>
            <StyledLeaveButton data-modalcontent={userId === headAdmin ? "head-admin-leave-group-confirmation" : "leave-group-confirmation"} onClick={handleSelectModalContent}>Leave Group</StyledLeaveButton>
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