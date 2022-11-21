import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { addGroup } from '../reducers/loginSlice';
import DeckList from './DeckList';
import GroupList from './GroupList';
import Modal from './Modal';
import RegisterJoinGroupsForm from './RegisterJoinGroupsForm';

function Dashboard() {
    const user = useSelector((state) => state.login);
    const [groupName, clearGroupNameChange, handleGroupNameChange] = useFormInput("");
    const [modalContent, setModalContent] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const createNewGroup = (evt) => {
        evt.preventDefault();
        dispatch(addGroup({creator: user.userId, name: groupName}))
            .then(response => {
                clearGroupNameChange();
                setModalContent("");
                navigate(`/groups/${response.payload}`);
            });
    }

    const selectForm = (evt) => {
        setModalContent(evt.target.dataset.form);
    }

    const displayModalContent = () => {
        if(modalContent === "join") {
            return <RegisterJoinGroupsForm hideModal={hideModal}/>
        } else if (modalContent === "create") {
            return (
                <form onSubmit={createNewGroup}>
                    <label htmlFor="group-name">Group Name</label>
                    <input type="text" id="group-name" name="group-name" value={groupName} onChange={handleGroupNameChange} />
                    <button type="submit">Create</button>
                </form>
            )
        } else {
            return 
        }
    }

    const goToNewDeckForm = () => {
        navigate(`/users/${user.userId}/decks/new`);
    }

    const hideModal = () => {
        setModalContent("");
    }

    return (
        <div>
            <div>
                <h1>{user.login.username}</h1>
                <p>{user.login.email}</p>
                <h1>Decks:</h1>
                <button onClick={goToNewDeckForm}>Create New Deck</button>
                <DeckList listType="user" listId={user.userId} />
                <h1>Groups:</h1>
                <button data-form="join" onClick={selectForm}>Search for Groups to Join</button>
                <button data-form="create" onClick={selectForm}>Create New Group</button>
                <GroupList groupIds={user.groups} />
                {!modalContent ?
                    null
                    :
                    <Modal hideModal={hideModal}>
                        {displayModalContent()}
                    </Modal>
                }
            </div>            
        </div>
    )
}

export default Dashboard