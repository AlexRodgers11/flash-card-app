import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import { Link, useParams } from "react-router-dom";

const baseURL = 'http://localhost:8000';

function AttemptTile(props) {
    const [attemptData, setAttemptData] = useState({});
    const { userId } = useParams();

    useEffect(() => {
        if(!attemptData.deckName) {
            axios.get(`${baseURL}/attempts/${props.attemptId}/tile`)
                .then((response) => {
                    setAttemptData(response.data);
                })
                .catch((err) => {
                    console.log(err.message);
                })
        }
    });

    if(!attemptData.deckName) {
        return null;
    }
    
    return (
        <Link to={`/users/${userId}/statistics/sessions/${props.attemptId}`}>
            <div style={{border: "1px solid black", display: "inline-block", margin: "1em", padding: "1em"}}>
                <p>{attemptData.deckName}</p>
                <p>Accuracy Rate: {attemptData.accuracyRate}%</p>
                <p>Date practiced: {attemptData.datePracticed}</p>
            </div>
        </Link>
    )
}

AttemptTile.propTypes = {
    attemptId: PropTypes.string
}

export default AttemptTile;