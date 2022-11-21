import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import axios from "axios";

const baseURL = 'http://localhost:8000';

function GroupTile(props) {
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
        <div onClick={handleViewGroup} style={{border: "1px solid black", display: "inline-block", margin: "1em", padding: "1em"}}>
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
