import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { addActivity, fetchGroupData, updateJoinCode } from '../reducers/groupSlice';
import DeckList from './DeckList';
import ActivityList from './ActivityList';
import GroupMemberList from './GroupMemberList';
import Modal from './Modal';
import useToggle from '../hooks/useToggle';
import axios from 'axios';
import { addDeck } from '../reducers/decksSlice';
import { addMessage } from '../reducers/loginSlice';


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
    const activityIds = useSelector((state) => state.group.activity);
    const joinCode = useSelector((state) => state.group.joinCode);
    const [joinCodeEditMode, toggleJoinCodeEditMode] = useToggle(false);
    const [joinCodeInputValue, clearJoinCodeInputValue, handleChangeJoinCodeInputValue, setJoinCodeInputValue] = useFormInput("");

    
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

    const goToCreateNew = () => {
        navigate(`/users/${userId}/decks/new`);
    }

    const handleSaveJoinCode = () => {
        toggleJoinCodeEditMode();
        dispatch(updateJoinCode({groupId, code: joinCodeInputValue}));
        clearJoinCodeInputValue();
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
                    <button onClick={sendJoinRequest}>Request to Join Group</button>
                    :
                    <p>Join code:
                        {joinCodeEditMode ? 
                            <form onSubmit={handleSaveJoinCode}><input onChange={handleChangeJoinCodeInputValue} value={joinCodeInputValue} /><button type="submit">Save</button><button onClick={cancelJoinCodeChange}>Cancel</button></form>
                            :
                            joinCode ? 
                                <><span> {joinCode} </span><button onClick={toggleJoinCodeEditMode}>Change</button></> 
                                : 
                                <button onClick={toggleJoinCodeEditMode}>Set Join Code</button>
                        }
                    </p>
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