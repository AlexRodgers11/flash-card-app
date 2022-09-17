import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router'
import { addActivity, fetchGroupData } from '../reducers/groupSlice';
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
    let { groupId } = useParams();
    const [showModal, toggleShowModal] = useToggle(false);
    let userId = useSelector((state) => state.login.userId);
    let decks = useSelector((state) => state.login.decks);
    let storedGroupId = useSelector((state) => state.group.groupId);
    let groupName = useSelector((state) => state.group.name);
    let groupMemberIds = useSelector((state) => state.group.memberIds);
    let administrators = useSelector((state) => state.group.administrators);
    let activityIds = useSelector((state) => state.group.activity);
    
    const chooseDeck = evt => {
        if(administrators.includes(userId)) {
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
                type: "add-deck-request",
                sendingUser: userId,
                targetDeck: evt.target.id
            }
            axios.post(`${baseURL}/groups/${groupId}/messages/admin`, message)
                .then((response) => {
                    console.log(response.data);
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

    useEffect(() => {
        if(!storedGroupId || storedGroupId !== groupId) {
            dispatch(fetchGroupData(groupId));
        }
    }, [storedGroupId, groupId, dispatch]);

    return (
        <div>
            <p>{groupName}</p>
            <h3>Administrators:</h3>
            <GroupMemberList groupMemberIds={administrators} />
            <h3>Activity:</h3>
            <ActivityList activityIds={activityIds}/>
            <GroupMemberList groupMemberIds={groupMemberIds} />
            <button onClick={toggleShowModal}>{!administrators.includes(userId) ? 'Submit Deck To Be Added' : 'Add Deck'}</button>
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
}

export default Group