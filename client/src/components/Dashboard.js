//needs to have user's decks, groupsimport axios from 'axios';
import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useToggle from '../hooks/useToggle';
import DeckList from './DeckList';
import GroupList from './GroupList';
import Modal from './Modal';
import RegisterJoinGroupsForm from './RegisterJoinGroupsForm';

function Dashboard() {
    const user = useSelector((state) => state.login);
    const [showGroupSearchModal, toggleGroupSearchModal] = useToggle(false);
    const navigate = useNavigate();
    
    const goToNewDeckForm = () => {
        navigate(`/users/${user.userId}/decks/new`);
    }

    const searchGroups = () => {
        if(!showGroupSearchModal) {
            toggleGroupSearchModal();
        }
    }

    return (
        <div>
            <div>
                <h1>{user.login.username}</h1>
                <img src={user.photo} />
                <p>{user.login.email}</p>
                <h1>Decks:</h1>
                <button onClick={goToNewDeckForm}>Create New Deck</button>
                <DeckList listType="user" listId={user.userId} />
                <h1>Groups:</h1>
                <button onClick={searchGroups}>Search for Groups to Join</button>
                <GroupList groupIds={user.groups} />
                {!showGroupSearchModal ?
                    null
                    :
                    <Modal hideModal={toggleGroupSearchModal}>
                        <RegisterJoinGroupsForm hideModal={toggleGroupSearchModal}/>
                    </Modal>
                }
            </div>            
        </div>
    )
}

export default Dashboard