import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { addActivity, addMember, fetchGroupData, updateGroup } from '../reducers/groupSlice';
import DeckList from './DeckList';
import ActivityList from './ActivityList';
import GroupMemberList from './GroupMemberList';
import Modal from './Modal';
import useToggle from '../hooks/useToggle';
import axios from 'axios';
import { addDeck } from '../reducers/decksSlice';
import { addMessage } from '../reducers/loginSlice';
import { generateJoinCode } from '../utils';


const baseURL = 'http://localhost:8000';

function Group() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { groupId } = useParams();
    const [showModal, toggleShowModal] = useToggle(false);
    const userId = useSelector((state) => state.login.userId);
    const decks = useSelector((state) => state.login.decks);
    const storedGroupId = useSelector((state) => state.group.groupId);
    const groupName = useSelector((state) => state.group.name);
    const groupMemberIds = useSelector((state) => state.group.memberIds);
    const administrators = useSelector((state) => state.group.administrators);
    const activityIds = useSelector((state) => state.group.activities);
    const allowJoinWithCode = useSelector((state) => state.group.allowJoinWithCode);
    const joinCode = useSelector((state) => state.group.joinCode);
    const [joinCodeEditMode, toggleJoinCodeEditMode] = useToggle(false);
    const [joinCodeVisible, toggleJoinCodeVisible] = useToggle(false);
    const [userEnteredJoinCode, clearUserEnteredJoinCode, handleChangeUserEnteredJoinCode, setUserEnteredJoinCode] = useFormInput("");

    
    const cancelJoinCodeChange = () => {
        toggleJoinCodeEditMode();
        clearJoinCodeInputValue();
    }
    
    const chooseDeck = evt => {
        if(administrators?.includes(userId)) {
            axios.get(`${baseURL}/decks/${evt.target.id}`)
            .then((response) => {
                axios.post(`${baseURL}/groups/${groupId}/decks`, response.data)
                    .then((res) => {
                        dispatch(addActivity({activityId: res.data.newActivity}));
                        dispatch(addDeck({deckId: res.data.newDeck}));
                        toggleShowModal();
                    })
                    .catch(err => console.error(err));
            })
            .catch(err => console.error(err));
        } else {
            let message = {
                requestType: "DeckSubmission",
                sendingUser: userId,
                targetGroup: groupId,
                targetDeck: evt.target.id
            }
            axios.post(`${baseURL}/groups/${groupId}/messages/admin`, message)
                .then((response) => {
                    dispatch(addMessage({message: response.data._id, direction: 'sent'}));
                    toggleShowModal();
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }

    const getNewJoinCode = () => {
        const newJoinCode = !allowJoinWithCode ? "" : generateJoinCode();
        dispatch(updateGroup({groupId, groupUpdates: {joinCode: newJoinCode}}));
    }

    const goToCreateNew = () => {
        navigate(`/users/${userId}/decks/new`);
    }

    const handleChangeJoinCodeAcceptance = () => {
        const newJoinCode = allowJoinWithCode ? "" : generateJoinCode();
        dispatch(updateGroup({groupId, groupUpdates: {allowJoinWithCode: !allowJoinWithCode, joinCode: newJoinCode}}));
        if(joinCodeVisible) {
            toggleJoinCodeVisible();
        }
    }


    const hideJoinCode = () => {
        toggleJoinCodeVisible();
        if(joinCodeEditMode) {
        toggleJoinCodeEditMode();
        }
    }
    
    const showJoinCode = () => {
        toggleJoinCodeVisible();
    }

    const sendJoinRequest = () => {
        const message = {
            requestType: "JoinRequest",
            sendingUser: userId,
            targetGroup: groupId
        }
        axios.post(`${baseURL}/groups/${groupId}/messages/admin`, message)
            .then(response => {
                dispatch(addMessage({message: response.data._id, direction: 'sent'}));
                //eventually need to make group able to be private (or maybe be private by default. If private, instead of routing to Group show modal stating group is private, with optional join button, if group allows join requests)
            })
            .catch(err => {
                console.error(err);
            });
    }

    useEffect(() => {
        if(!storedGroupId || storedGroupId !== groupId) {
            dispatch(fetchGroupData({groupId, userId}));
        }
    }, [dispatch, groupId, storedGroupId, userId]);

    if(groupMemberIds?.includes(userId)) {
        return (
            <div>
                <p>{groupName}</p>
                {!administrators?.includes(userId) ? 
                    null
                    :
                    <>
                        <div>
                            <label htmlFor="join-code-options">Allow People to Join with a Code</label>
                            <div id="join-code-options">
                                <label htmlFor="do-allow-join-code">Yes</label>
                                <input id="do-allow-join-code" type="radio" name="allow-join-code" value="true" checked={allowJoinWithCode} onChange={handleChangeJoinCodeAcceptance} />
                                <label htmlFor="do-not-allow-join-code">No</label>
                                <input id="do-not-allow-join-code" type="radio" name="allow-join-code" value="true" checked={!allowJoinWithCode} onChange={handleChangeJoinCodeAcceptance}/>
                            </div>
                        </div>
                        {!allowJoinWithCode ?
                            null
                            :
                            <>
                                {!joinCodeVisible ? 
                                    <button onClick={showJoinCode}>Show Group Join Code</button>
                                : 
                                    <div>
                                        <p>Join Code: {joinCode} <button onClick={getNewJoinCode}>Get New Code</button></p>
                                        <button onClick={hideJoinCode}>Hide Join Code</button>
                                    </div>
                        }
                            </>
                        }                    
                    </>
                }
                <h3>Administrators:</h3>
                <GroupMemberList groupMemberIds={administrators} />
                <h3>Activity:</h3>
                <ActivityList activityIds={activityIds}/>
                <GroupMemberList groupMemberIds={groupMemberIds} />
                <button onClick={toggleShowModal}>{!administrators?.includes(userId) ? 'Submit Deck To Be Added' : 'Add Deck'}</button>
                {!showModal ?
                    null
                    :
                    <Modal hideModal={toggleShowModal}>
                        {decks.map(deck => <span key={deck._id} id={deck._id} onClick={chooseDeck}>{deck.name}</span>)}<button onClick={goToCreateNew}>Create new deck</button>
                    </Modal>
                }
                <DeckList listType="group" listId={groupId} />
            </div>
      )
    } else {
        return (
            <div>
                <p>This group is Private</p>
                <button onClick={sendJoinRequest}>Request to Join Group</button>
            </div>
        )
    }

    
}

export default Group