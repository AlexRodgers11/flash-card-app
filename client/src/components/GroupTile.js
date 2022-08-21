import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import axios from "axios";

function GroupTile(props) {
    const baseURL = 'http://localhost:8000';
    const [groupData, setGroupData] = useState({});
    const navigate = useNavigate();
    const handleViewGroup = (evt) => {
        navigate(`/groups/${props.groupId}`);
    }

    useEffect(() => {
        axios.get(`${baseURL}/groups/${props.groupId}?tile=true`)
            .then((response) => setGroupData(response.data))
            .catch((err) => console.log(err));
    }, [props.groupId]);
  
    return (
        <div onClick={handleViewGroup}>
            <h1>{groupData.name}</h1>
            <p>Members: {groupData.memberCount}</p>
            <p>Decks: {groupData.deckCount}</p>
        </div>
    )
}

GroupTile.propTypes = {
    groupId: PropTypes.string
}

export default GroupTile
