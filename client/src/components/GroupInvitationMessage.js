import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { MessageContentContainer } from './StyledComponents/MessageContentContainer';
import { MessagePreviewContent } from './StyledComponents/MessagePreviewContent';
import { client } from '../utils';
import { makeGroupInvitationDecision } from '../reducers/communicationsSlice';
import { fetchGroupData } from '../reducers/groupSlice';
import { addGroup, fetchLoggedInUserData } from '../reducers/loginSlice';


const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function GroupInvitationMessage(props) {
	const userId = useSelector((state) => state.login.userId);
	const [sender, setSender] = useState({});
    const [read, setRead] = useState(false);
    const [targetUser, setTargetUser] = useState()
    const [targetGroup, setTargetGroup] = useState({})
	const [comment, setComment] = useState();
    const [loading, setLoading] = useState(true);
    const [acceptanceStatus, setAcceptanceStatus] = useState("");
    const dispatch = useDispatch();

	useEffect(() => {
		if(loading) {
            (async () => {
                try {
					const messageRetrievalResponse = await client.get(`${baseURL}/messages/${props.messageId}?type=GroupInvitation`);
					let data = messageRetrievalResponse.data;
					setSender(data.sendingUser);
                    setRead(data.read.includes(userId));
					setTargetGroup(data.targetGroup);
                    setTargetUser(data.targetUser);
                    setComment(data.comment);
                    setLoading(false);
                    setAcceptanceStatus(data.acceptanceStatus);
                    props.setMessageRendered(true);
				} catch (err) {
					console.error(err.message);
				}

			})();
		}
	}, [loading, props, userId]);

    const submitUserDecision = (evt) => {
		dispatch(makeGroupInvitationDecision({messageId: props.messageId, decision: evt.currentTarget.dataset.decision}))
			.then((response) => {
                console.log({payload: response.payload});
				if(response.payload.acceptanceStatus === "approved") {
                    dispatch(addGroup({groupId: targetGroup._id}));
                }

				props.hideModal();
			});
	}

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
                        <p><span>{read ? 'Read': 'Unread'}:</span><span>{sender.login.username}</span>Invited you to join group <span>{targetGroup?.name || "deleted group"}</span></p>
                        {comment && <p>Comment: "{comment}"</p>}
                        {acceptanceStatus === "pending" && 
                            userId !== sender._id && <><button data-decision="approved" onClick={submitUserDecision}>Accept</button><button data-decision="denied" onClick={submitUserDecision}>Decline</button></>
                        }
                    </div>
                    :
                    <MessagePreviewContent read={read} >
                        {props.direction === "received" ? <p>From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {targetUser?.login?.username || targetUser ? `${targetUser.name.first} ${targetUser.name.last}` : "deleted user"}</p>}
                        <p><span>{sender.login.username}</span>Invited you to join group <span>{targetGroup?.name || "deleted group"}</span></p>
                        {comment && <p>Comment: "{comment}"</p>}
                    </MessagePreviewContent>
                }
            </MessageContentContainer>
        )
    }
}

GroupInvitationMessage.propTypes = {
    fullView: PropTypes.bool,
    messageId: PropTypes.string,
    messageType: PropTypes.string,
    setMessageRendered: PropTypes.func
}

export default GroupInvitationMessage;
