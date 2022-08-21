//needs to have user's decks, groupsimport axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router'
import useToggle from '../hooks/useToggle';
import DeckList from './DeckList';
import GroupList from './GroupList';

function Dashboard() {
    const user = useSelector((state) => state.login);


    return (
        <div>
            <div>
                <h1>{user.username}</h1>
                <p>{user.photo}</p>
                <p>{user.email}</p>
                <h1>Decks:</h1>
                <DeckList listType="user" listId={user.userId} />
                <h1>Groups:</h1>
                <GroupList groupIds={user.groups} />



            </div>            
        </div>
    )
}

export default Dashboard