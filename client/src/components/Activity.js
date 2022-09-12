import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';

// const buildActivity = 

const baseURL = 'http://localhost:8000';

function Activity(props) {
    const [type, setType] = useState('');
    const [date, setDate] = useState('');
    const [actor, setActor] = useState('');
    const [content, setContent] = useState('');
    const [groupTarget, setGroupTarget] = useState('');
    const [deckTarget, setDeckTarget] = useState('');

    useEffect(() => {
        if(!type) {
            axios.get(`${baseURL}/activities/${props.activityId}`)
                .then((response) => {
                    setType(response.data.type);
                    setDate(response.data.date);
                    setActor(response.data.actor);
                    setContent(response.data.content);
                    setGroupTarget(response.data.groupTarget);
                    setDeckTarget(response.data.deckTarget);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }, [props.activityId]);

    return (
        <div>Activity</div>
    )
}

Activity.propTypes = {
    activityId: PropTypes.string
}

export default Activity;
