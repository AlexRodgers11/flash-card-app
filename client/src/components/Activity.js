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

    const renderActivity = () => {
        let activityType = type;
        switch(activityType) {
            case 'create-group':
                return (
                    <div>
                        <p>{date}</p>
                        <p>{groupTarget} was created by {actor.login.username}</p>
                    </div>
                )
            case 'add-deck':
                return (
                    <div>
                        <p>{date}</p>
                        <p>Deck {deckTarget} was added by {actor.login.username}</p>
                    </div>
                )
            default:
                return null;
        }
    }
    
    useEffect(() => {
        if(!type) {
            axios.get(`${baseURL}/activities/${props.activityId}`)
                .then((response) => {
                    setType(response.data.type);
                    setDate(response.data.createdAt);
                    setActor(response.data.actor);
                    setContent(response.data.content);
                    setGroupTarget(response.data.groupTarget?.name);
                    setDeckTarget(response.data.deckTarget?.name);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }, [props.activityId, type]);

    return (
        <div>{renderActivity()}</div>
    )
}

Activity.propTypes = {
    activityId: PropTypes.string
}

export default Activity;
