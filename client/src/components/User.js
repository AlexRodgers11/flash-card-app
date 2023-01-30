import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import DeckList from './DeckList';

function User() {
    const { userId } = useParams(); 
    const [userData, setUserData] = useState({});
    
    const baseURL = 'http://localhost:8000';

    useEffect(() => {
        if(userData._id !== userId) {
            (async () => {
                try {
                    const userDataResponse = await axios.get(`${baseURL}/users/${userId}`);
                    setUserData(userDataResponse.data);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    }, [userData._id, userId]);

    if(userData._id !== userId) {
        return <>Loading</>
    } else {
        return (
            <div>
                <h1>{userData.login?.username}</h1>
                <p>{userData.login.password}</p>
                <p>{userData.photo}</p>
                <p>{userData.login.email}</p>
                <DeckList listType="user" listId={userId} />
            </div>
        );
    }
}

export default User