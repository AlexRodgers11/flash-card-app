import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useSelector } from 'react-redux';


const baseURL = 'http://localhost:8000';

function DeckDecisionMessage(props) {
	const userId = useSelector((state) => state.login.userId);
	const [sender, setSender] = useState({});
	const [deckName, setDeckName] = useState();
    const [read, setRead] = useState(false);
    const [targetUser, setTargetUser] = useState()
	const [targetDeck, setTargetDeck] = useState();
    const [targetGroup, setTargetGroup] = useState({})
	const [acceptanceStatus, setAcceptanceStatus] = useState();
	const [comment, setComment] = useState();

	useEffect(() => {
        console.log("in useEffect of DeckDecisionMessage");
		if(!acceptanceStatus) {
            (async () => {
                try {
                    console.log("retrieving data");
                    console.log({messageId: props.messageId});
					const messageRetrievalResponse = await axios.get(`${baseURL}/messages/${props.messageId}?type=DeckDecision`);
                    console.log({messageRetrievalResponse});
					let data = messageRetrievalResponse.data;
                    console.log({data});
					setSender(data.sendingUser);
                    setRead(data.read.includes(userId));
					setTargetGroup(data.targetGroup);
                    setDeckName(data.deckName);
                    setTargetUser(data.targetUser);
                    if(data.targetDeck) {
                        setTargetDeck(data.targetDeck);
                    }
                        
                    setAcceptanceStatus(data.acceptanceStatus);
                    setComment(data.comment);
				} catch (err) {
					console.error(err.message);
				}

			})();
		}
	}, [acceptanceStatus, props.messageId]);

    if(!acceptanceStatus) {
        console.log("acceptance status not found");
        return (
            <></>
        );
    } else {
        console.log("acceptance status found");
        return (
            <div>
                {props.fullView ? 
                    <div>
                        {props.direction === "received" ? <p>From: {sender.login.username || `${sender.name.first} ${sender.name.last}`}</p> : <p>To: {targetUser.login.username || `${targetUser.name.first} ${targetUser.name.last}`}</p>}
                        <p><span>{read ? 'Read': 'Unread'}:</span><span>{sender.login.username}</span> {acceptanceStatus} your request to add deck: {deckName} to <span>{targetGroup.name}</span></p>
                        {comment && <p>Comment: "{comment}"</p>}
                    </div>
                    :
                    <div>
                        {props.direction === "received" ? <p>From: {sender.login.username || `${sender.name.first} ${sender.name.last}`}</p> : <p>To: {targetUser.login.username || `${targetUser.name.first} ${targetUser.name.last}`}</p>}
                        <p><span>{read ? 'Read': 'Unread'}:</span><span>{sender.login.username}</span> {acceptanceStatus} your request to add deck: {deckName} to <span>{targetGroup.name}</span></p>
                        <hr />
                    </div>
                }
            </div>
        )
    }
}

DeckDecisionMessage.propTypes = {
    fullView: PropTypes.bool,
    messageId: PropTypes.string,
}

export default DeckDecisionMessage;
