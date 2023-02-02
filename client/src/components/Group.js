import React, { useEffect, useRef, useState } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { addActivity, addMember, deleteGroup, fetchGroupData, removeMember, replaceHeadAdmin, updateGroup } from '../reducers/groupSlice';
import { submitDeck } from "../reducers/communicationsSlice";
import DeckList from './DeckList';
import ActivityList from './ActivityList';
import GroupMemberList from './GroupMemberList';
import Modal from './Modal';
import useToggle from '../hooks/useToggle';
import axios from 'axios';
import { addAdminDeck, fetchDecksOfUser } from '../reducers/decksSlice';
import { removeGroup } from '../reducers/loginSlice';
import { generateJoinCode } from '../utils';
import GroupMemberOption from './GroupMemberOption';
import styled from 'styled-components';

const GroupWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    & section {
        width: 100%;
    }
`;

const DeckOptionContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    & p {
        width: 250px;
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 1rem;
        @media (max-width: 400px) {
            width: 200px;
            font-size: .9rem;
        }
    }
`;

const DeckOption = styled.div`
    width: 250px;
    border: 1px solid black;
    margin-bottom: .25rem;
    padding: .15rem;
    cursor: pointer;
    @media (max-width: 400px) {
        width: 200px;
        font-size: .75rem;
    }
`;

const GroupMemberOptionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    & p {
        width: 250px;
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 1rem;
        @media (max-width: 400px) {
            width: 200px;
            font-size: .9rem;
        }
    }
`;

const JoinOptionContainer = styled.div`
    display: inline-block;
    margin-bottom: 3.75rem;
    & label {
        margin-right: .5rem;
    }
    & select {
        display: inline-block;
        padding: .275rem .55rem;
        margin-bottom: .25rem;
    }
    @media (max-width: 500px) {
        font-size: .85rem;
    }
`;

const GroupEditControlsContainer = styled.div`
    display: inline-block;
    & button {
        display: inline-block;
        margin: 1rem .25rem;
    }
`;

const JoinCodeContainer = styled.div`
    // margin-bottom: 3rem;
    & button {
        display: inline-block;
    }
`;

const Heading = styled.p`
    margin: 2rem;
    font-size: 3.5rem;
    font-weight: 600;
    @media (max-width: 500px) {
        margin: 1rem;
        font-size: 1.5rem;
    }
`;

const SubHeading = styled.p`
    font-size: 2.25rem;
    margin-bottom: 1rem !important;
    @media (max-width: 500px) {
        margin-bottom: .5rem !important;
        font-size: 1.25rem;
        font-weight: 500;
    }
`;

const baseURL = 'http://localhost:8000';

function Group() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { groupId } = useParams();
    const [modalContent, setModalContent] = useState("");
    const [editMode, toggleEditMode] = useToggle(false);
    const userId = useSelector((state) => state.login.userId);
    const userDecks = useSelector((state) => state.login.decks);
    const messageCount = useSelector((state) => state.communications.messages.received.length);
    const notificationCount = useSelector((state) => state.communications.notifications.length);
    const [groupDeletionInProgress, toggleGroupDeletionInProgress] = useToggle(false);
    const storedGroupId = useSelector((state) => state.group.groupId);
    const groupName = useSelector((state) => state.group.name);
    const groupMemberIds = useSelector((state) => state.group.memberIds);
    const headAdmin = useSelector((state) => state.group.headAdmin);
    const administrators = useSelector((state) => state.group.administrators);
    const activityIds = useSelector((state) => state.group.activities);
    const joinOptions = useSelector((state) => state.group.joinOptions);
    const joinCode = useSelector((state) => state.group.joinCode);//need to figure out how to make sure only admins can see this
    const [joinCodeVisible, toggleJoinCodeVisible] = useToggle(false);
    const [userEnteredJoinCode, clearUserEnteredJoinCode, handleChangeUserEnteredJoinCode, setUserEnteredJoinCode] = useFormInput("");
    const [deleteConfirmation, clearDeleteConfirmation, handleChangeDeleteConfirmation] = useFormInput("");
    
    const chooseDeck = evt => {
        if(administrators?.includes(userId)) {
            dispatch(addAdminDeck({deckId: evt.target.dataset.id, adminId: userId, groupId}))
                .then(() => {
                    // dispatch(addActivity({activityId: res.data.newActivity}));
                    setModalContent("");
                });
        } else {
            console.log({userId, groupId, deckId: evt.target.id});
            dispatch(submitDeck({userId, groupId, deckId: evt.target.id}));
            setModalContent("");
        }
    }
    
    const displayModalContent = () => {
        switch(modalContent) {
            case "add-deck":
                return (
                    <DeckOptionContainer>
                        <p>{!administrators?.includes(userId) ? "Submit Deck To Be Added" : "Select a deck to submit"}</p>
                        {userDecks.map(deck => 
                            <DeckOption data-id={deck._id} key={deck._id} id={deck._id} onClick={chooseDeck}>
                                {deck.name}
                            </DeckOption>
                        )}
                        <button onClick={goToCreateNew}>Create new deck</button>
                    </DeckOptionContainer>
                );
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
            case "delete-group-options":
                return (
                    <div>
                        <p>Are you sure you want to delete the group instead of giving control to another member?</p>
                        <button data-modalcontent="delete-group-confirmation" onClick={handleSelectModalContent}>Yes, Delete</button>
                        <button data-modalcontent="group-control-designation" onClick={handleSelectModalContent}>No, Pick A Member to Give Control To</button>
                        <button onClick={hideModal}>Cancel</button>
                    </div>
                )
            case "delete-group-confirmation":
                return (
                    <form onSubmit={handleDeleteGroup}>
                        <label htmlFor="confirm-delete-group">Type the group's name to delete. This action cannot be undone.</label>
                        <input id="confirm-delete-group" name="confirm-delete-group" type="text" onChange={handleChangeDeleteConfirmation} value={deleteConfirmation} />
                        {deleteConfirmation === groupName && <button type="submit">Delete</button>}
                    </form>
                )
            default:
                return;
        }
    }

    const getNewJoinCode = () => {
        const newJoinCode = generateJoinCode();
        dispatch(updateGroup({groupId, groupUpdates: {joinCode: newJoinCode}}));
    }

    const goToCreateNew = () => {
        navigate(`/users/${userId}/decks/new`);
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
    
    const handleChangeJoinOptions = (evt) => {
        let newJoinCode;
        if(evt.target.value === "code" || evt.target.value === "code-and-request") {
            if(joinOptions !== "code" && joinOptions !== "code-and-request") {
                newJoinCode = generateJoinCode();
                toggleJoinCodeVisible();
                dispatch(updateGroup({groupId, groupUpdates:{joinOptions: evt.target.value, joinCode: newJoinCode}}));
            } else {
                dispatch(updateGroup({groupId, groupUpdates: {joinOptions: evt.target.value}}));
            }
        } else {
            newJoinCode = "";
            if(joinCodeVisible) {
                toggleJoinCodeVisible();
            }
            dispatch(updateGroup({groupId, groupUpdates:{joinOptions: evt.target.value, joinCode: newJoinCode}}));
        }
    }

    const handleLeaveGroup = () => {
        dispatch(removeMember({groupId, memberToRemoveId: userId, requesterId: userId}))
            .then((action) => {
                dispatch(removeGroup({groupId}));
                navigate("/dashboard");
            });
    }

    const handleSelectModalContent = (evt) => {
        setModalContent(evt.target.dataset.modalcontent);
    }

    const handleSelectNewHeadAdmin = (evt) => {
        evt.preventDefault();
        batch(() => {
            dispatch(replaceHeadAdmin({groupId, newAdminId: evt.currentTarget.dataset.memberid}));
            dispatch(removeGroup({groupId}));
        });
        navigate("/dashboard");
    }
    
    const handleSubmitUserEnteredJoinCode = (evt) => {
        evt.preventDefault();
        if(userEnteredJoinCode === joinCode) {
            dispatch(addMember({groupId, userId}));//
        } else {
            //add logic here to count missed attempts within certain window, or maybe handle on backend
            clearUserEnteredJoinCode();
        }
    }

    const hideModal = () => {
        setModalContent("");
    }

    // const sendJoinRequest = () => {
    //     const message = {
    //         requestType: "JoinRequest",
    //         sendingUser: userId,
    //         targetGroup: groupId
    //     }
    //     axios.post(`${baseURL}/groups/${groupId}/messages/admin`, message)
    //         .then(response => {
    //             dispatch(addMessage({message: response.data._id, direction: 'sent'}));
    //             //eventually need to make group able to be private (or maybe be private by default. If private, instead of routing to Group show modal stating group is private, with optional join button, if group allows join requests)
    //         })
    //         .catch(err => {
    //             console.error(err);
    //         });
    // }

    const firstRender = useRef(true);
    useEffect(() => {
        if(!firstRender.current) {
            dispatch(fetchGroupData({groupId, userId}));
        } else {
            firstRender.current = false;
        }
    }, [dispatch, groupId, userId, messageCount, notificationCount]);

    useEffect(() => {
        if(!storedGroupId || (storedGroupId !== groupId)) {
            if(groupDeletionInProgress) {
                //possibly add setTimeout and loading spinner
                navigate("/dashboard");
            } else {
                dispatch(fetchGroupData({groupId, userId})); 
            }
               
        }
    }, [dispatch, groupId, groupDeletionInProgress, navigate, storedGroupId, userId]);

    if(groupDeletionInProgress) {
        return (<p>Deleting Group</p>)
    }

    if(groupMemberIds?.includes(userId)) {
        return (
            <GroupWrapper className="GroupWrapper">
                <Heading>{groupName}</Heading>
                <GroupEditControlsContainer className="GroupEditControlsContainer">
                    {administrators?.includes(userId) && <button onClick={toggleEditMode}>{editMode ? "Done" : "Edit"}</button>}
                    <button data-modalcontent={userId === headAdmin ? "head-admin-leave-group-confirmation" : "leave-group-confirmation"} onClick={handleSelectModalContent}>Leave Group</button>
                    {(editMode && userId === headAdmin) && <button data-modalcontent={groupMemberIds.length > 1 ? "delete-group-options" : "delete-group-confirmation"} onClick={handleSelectModalContent}>Delete Group</button>}
                </GroupEditControlsContainer>
                {!administrators?.includes(userId) ?
                    null
                    :
                    <>
                        <JoinOptionContainer className="JoinOptionContainer">
                            <label htmlFor="join-code-options">Select how new members can join:</label>
                            <select id="join-code-options" name="join-code-options" onChange={handleChangeJoinOptions}>
                                <option selected={joinOptions === "invite"} value="invite">Invite Only</option>
                                <option selected={joinOptions === "code"} value="code">Join Code</option>
                                <option selected={joinOptions === "request"} value="request">Request by User</option>
                                <option selected={joinOptions === "code-and-request"} value="code-and-request">Join Code and Request by User</option>
                            </select>
                        {joinOptions !== "code" && joinOptions !== "code-and-request" ?
                            null
                            :
                            <JoinCodeContainer>
                                {!joinCodeVisible ? 
                                    <button onClick={toggleJoinCodeVisible}>Show Group Join Code</button>
                                    :
                                    <div>
                                        <span>Join Code: {joinCode} </span>
                                        <button onClick={getNewJoinCode}>Get New Code</button>
                                        <button onClick={toggleJoinCodeVisible}>Hide Join Code</button>
                                    </div>
                                }
                            </JoinCodeContainer>
                        }     
                        </JoinOptionContainer>

                    </>
                }                
                
                <section style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <SubHeading>Members:</SubHeading>
                    <GroupMemberList editMode={administrators.includes(userId) && editMode} listType="members" groupMemberIds={groupMemberIds} />
                </section>

                <section>
                    {/* <ActivityList activityIds={activityIds}/> */}
                </section>

                <section>
                    <SubHeading>Decks:</SubHeading>
                    <button data-modalcontent="add-deck" onClick={handleSelectModalContent}>{!administrators?.includes(userId) ? 'Submit Deck To Be Added' : 'Add Deck'}</button>
                    <DeckList listType="group" listId={groupId} />
                    {!modalContent ?
                        null
                        :
                        <Modal hideModal={hideModal}>
                            {displayModalContent()}
                        </Modal>
                    }
                </section>
            </GroupWrapper>
      )
    } else {
        return (
            <div>
                {/* set up to either show input for joinCode or button to request join */}
                {/* change this to be a Modal with the form for optoins */}
                <p>This group is Private</p>
                {joinCode ? 
                    <form onSubmit={handleSubmitUserEnteredJoinCode}>
                        <label htmlFor="userEnteredJoinCode">Enter code to join the group</label>
                        <input name="userEnteredJoinCode" id="userEnteredJoinCode" value={userEnteredJoinCode} onChange={handleChangeUserEnteredJoinCode} />
                        {userEnteredJoinCode && <button type="submit">Join</button>}
                    </form>
                    :
                    // <button onClick={sendJoinRequest}>Request to Join Group</button>
                    <button>Request to Join Group</button>
                }
            </div>
        )
    }

    
}

export default Group