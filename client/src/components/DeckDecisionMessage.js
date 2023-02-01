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
    const [loading, setLoading] = useState(true);

	useEffect(() => {
		if(loading) {
            (async () => {
                try {
					const messageRetrievalResponse = await axios.get(`${baseURL}/messages/${props.messageId}?type=DeckDecision`);
					let data = messageRetrievalResponse.data;
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
                    setLoading(false);
				} catch (err) {
					console.error(err.message);
				}

			})();
		}
	}, [loading, userId, props.messageId]);

    if(loading) {
        return (
            <></>
        );
    } else {
        return (
            <div>
                {props.fullView ? 
                    <div>
                        {props.direction === "received" ? <p>From: {sender?.login.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {targetUser?.login.username || targetUser ? `${targetUser.name.first} ${targetUser.name.last}` : "deleted user"}</p>}
                        <p><span>{read ? 'Read': 'Unread'}:</span><span>{sender.login.username}</span> {acceptanceStatus} your request to add deck: {deckName} to <span>{targetGroup.name}</span></p>
                        {comment && <p>Comment: "{comment}"</p>}
                    </div>
                    :
                    <div>
                        {props.direction === "received" ? <p>From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {targetUser?.login?.username || targetUser ? `${targetUser.name.first} ${targetUser.name.last}` : "deleted user"}</p>}
                        <p><span>{read ? 'Read': 'Unread'}:</span><span>{sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</span> {acceptanceStatus} your request to add deck: {deckName || "deleted deck"} to <span>{targetGroup?.name || "deleted group"}</span></p>
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