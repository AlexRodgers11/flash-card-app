import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { addMember, fetchGroupData } from '../reducers/groupSlice';
import useFormInput from '../hooks/useFormInput';
import { makeJoinRequestDecision } from '../reducers/communicationsSlice';
import { MessageContentContainer } from './StyledComponents/MessageContentContainer';
import { MessagePreviewContent } from './StyledComponents/MessagePreviewContent';
import { client } from '../utils';


const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function JoinRequestMessage(props) {
	const userId = useSelector((state) => state.login.userId);
	const storedGroupId = useSelector((state) => state.group.groupId);
	const [sender, setSender] = useState();
    const [targetGroup, setTargetGroup] = useState({})
	const [read, setRead] = useState(false);
	const [decision, setDecision] = useState("");
	const [comment, clearComment, handleCommentChange, setComment] = useFormInput("");
	const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
	const dispatch = useDispatch();

	useEffect(() => {
		if(loading) {
			(async () => {
				try {
					const messageRetrievalResponse = await client.get(`${baseURL}/messages/${props.messageId}?type=JoinRequest`);
					let data = messageRetrievalResponse.data;
					setSender(data.sendingUser);
					setRead(data.read.includes(userId));
					setTargetGroup(data.targetGroup);
					setLoading(false);
					props.setMessageRendered(true);
				} catch (err) {
					console.error(err);
				}

			})();
		}
	}, [loading, props, userId]);

	const acceptUser = () => {
		setDecision("approved");
	}

	const denyUser = () => {
		setDecision("denied");
	}

	const submitUserDecision = () => {
		dispatch(makeJoinRequestDecision({messageId: props.messageId, decision, comment}))
			.then((response) => {
				if(!response.payload.sentMessage) {
					alert(response.payload);
				} else if(response.payload.acceptanceStatus === "approved" && storedGroupId === targetGroup._id) {
                    dispatch(fetchGroupData({userId, groupId: targetGroup._id}));
                }

				props.hideModal();
			});
	}

	const clearDecision = () => {
        setComment("");
        setDecision("");
    }

    const reviewUser = () => {
		props.hideModal();
		navigate(`users/${sender._id}?review=true`);
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
                        {props.direction === "received" ? <p>From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {targetGroup?.name || "deleted group"} admins</p>}
                        <p><span>{sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</span> would like to join: {targetGroup?.name || "deleted group"}</p>
                        {!decision ? 
                            userId !== sender._id && <><button disabled={!targetGroup?.name} onClick={acceptUser}>Accept</button><button disabled={!targetGroup?.name} onClick={denyUser}>Decline</button><button disabled={!targetGroup?.name} onClick={reviewUser}>View User</button></>
                            :
                            userId !== sender._id && 
                                <div>
                                    <textarea name="comments" id="comments" onChange={handleCommentChange} value={comment} placeholder="Add a comment (optional)"></textarea>
                                    <button disabled={!targetGroup?.name} className="btn btn-primary btn-md" onClick={submitUserDecision}>Submit decision to {decision === "approved" ? "approve" : "deny"} the request</button><button className="btn btn-danger btn-md" onClick={clearDecision}>Cancel</button>
                                </div>
                        }
                                                
                    </div>
                    :
                    <MessagePreviewContent read={read}>
                        {props.direction === "received" ? <p className="MessageContent">From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p className="MessageContent">To: {targetGroup?.name || "deleted user"} admins</p>}
                        <p className="MessageContent"><span>{sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</span> would like to join: {targetGroup?.name || "deleted group"}</p>
                        {/* <hr /> */}
                    </MessagePreviewContent>
                }
            </MessageContentContainer>
		)
	}
}

JoinRequestMessage.propTypes = {
    fullView: PropTypes.bool,
    messageId: PropTypes.string,
	messageType: PropTypes.string,
	setMessageRendered: PropTypes.func
}


export default JoinRequestMessage;
