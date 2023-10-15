import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { MessageContentContainer } from './StyledComponents/MessageContentContainer';
import { MessagePreviewContent } from './StyledComponents/MessagePreviewContent';
import { client } from '../utils';


const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function JoinDecisionMessage(props) {
	const userId = useSelector((state) => state.login.userId);
	const [sender, setSender] = useState({});
    const [read, setRead] = useState(false);
    const [targetUser, setTargetUser] = useState()
    const [targetGroup, setTargetGroup] = useState({})
	const [acceptanceStatus, setAcceptanceStatus] = useState();
	const [comment, setComment] = useState();
    const [loading, setLoading] = useState(true);

	useEffect(() => {
		if(loading) {
            (async () => {
                try {
					const messageRetrievalResponse = await client.get(`${baseURL}/messages/${props.messageId}?type=JoinDecision`);
					let data = messageRetrievalResponse.data;
					setSender(data.sendingUser);
                    setRead(data.read.includes(userId));
					setTargetGroup(data.targetGroup);
                    setTargetUser(data.targetUser);
                    setAcceptanceStatus(data.acceptanceStatus);
                    setComment(data.comment);
                    setLoading(false);
                    props.setMessageRendered(true);
				} catch (err) {
					console.error(err.message);
				}

			})();
		}
	}, [loading, props, userId]);

    if(loading) {
        return (
            <></>
        );
    } else {
        return (
            <MessageContentContainer>
                {props.fullView ? 
                    <div>
                        {props.direction === "received" ? <p>From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {targetUser?.login?.username || targetUser ? `${targetUser.name.first} ${targetUser.name.last}` : "deleted user"}</p>}
                        <p><span>{read ? 'Read': 'Unread'}:</span><span>{sender.login.username}</span> {acceptanceStatus} your request to join group <span>{targetGroup.name}</span></p>
                        {comment && <p>Comment: "{comment}"</p>}
                    </div>
                    :
                    <MessagePreviewContent read={read}>
                        {props.direction === "received" ? <p>From: {sender?.login?.username || `${sender.name.first} ${sender.name.last}`}</p> : <p>To: {targetUser.login.username || `${targetUser.name.first} ${targetUser.name.last}`}</p>}
                        <p><span>{sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</span> {acceptanceStatus} your request to join group: <span>{targetGroup?.name || "deleted group"}</span>.</p>
                        {/* <hr /> */}
                    </MessagePreviewContent>
                }
            </MessageContentContainer>
        )
    }
}

JoinDecisionMessage.propTypes = {
    fullView: PropTypes.bool,
    messageId: PropTypes.string,
    messageType: PropTypes.string,
    setMessageRendered: PropTypes.func
}

export default JoinDecisionMessage;
