//needs to have user's decks, groupsimport axios from 'axios';
import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import DeckList from './DeckList';
import GroupList from './GroupList';

function Dashboard() {
    const user = useSelector((state) => state.login);
    const navigate = useNavigate();
    
    const goToNewDeckForm = () => {
        navigate(`/users/${user.userId}/decks/new`);
    }

    return (
        <div>
            <div>
                <h1>{user.username}</h1>
                <p>{user.photo}</p>
                <p>{user.email}</p>
                <h1>Decks:</h1>
                <button onClick={goToNewDeckForm}>Create New Deck</button>
                <DeckList listType="user" listId={user.userId} />
                <h1>Groups:</h1>
                <GroupList groupIds={user.groups} />
            </div>            
        </div>
    )
}

export default Dashboard