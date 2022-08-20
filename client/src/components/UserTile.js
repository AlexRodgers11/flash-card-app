import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { useNavigate } from 'react-router';

function UserTile(props) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({});

    useEffect(() => {
        console.log(props.memberId);
        const baseURL = 'http://localhost:8000';
        axios.get(`${baseURL}/users/${props.memberId}?partial=true`)
            .then((response) => setUserData(response.data));
    }, [props.memberId]);

    const handleClick = evt => {
        evt.preventDefault();
        navigate(`/users/${props.memberId}`);
    }

    return (
        <div onClick={handleClick}>
            <h1>{userData.username}</h1>
            <h2>{userData.firstName} {userData.lastName}</h2>
            <p>{userData.email}</p>
            <p>{userData.photo}</p>
        </div>
    )
}

UserTile.propTypes = {
    userId: PropTypes.string
}

export default UserTile
