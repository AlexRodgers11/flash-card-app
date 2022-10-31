import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useToggle from '../hooks/useToggle';
import DeckList from './DeckList';

function User() {
    const { userId } = useParams(); 
    const [userData, setUserData] = useState({});
    const [loaded, toggleLoaded] = useToggle(false);
    

    useEffect(() => {
        if(!loaded) {
            const baseURL = 'http://localhost:8000';
            axios.get(`${baseURL}/users/${userId}`)
                .then((response) => {
                    setUserData(response.data);
                    toggleLoaded();
                })
                .catch((err) => console.log(err));
        }
    }, [loaded, toggleLoaded, userId]);

    return (
        <div>
            {loaded ? 
                <div>
                    <h1>{userData.login?.username}</h1>
                    <p>{userData.login.password}</p>
                    <p>{userData.photo}</p>
                    <p>{userData.login.email}</p>
                    <DeckList listType="user" listId={userId} />
                </div>
                :
                null
            }
            
        </div>
    )
}

export default User