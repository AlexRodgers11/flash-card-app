import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { addMember } from '../reducers/groupSlice';
import useFormInput from '../hooks/useFormInput';
import { makeJoinRequestDecision } from '../reducers/communicationsSlice';


const baseURL = 'http://localhost:8000';

function JoinRequestMessage(props) {
	const userId = useSelector((state) => state.login.userId);
	const storedGroupId = useSelector((state) => state.group.groupId);
	const [sender, setSender] = useState();
    const [targetGroup, setTargetGroup] = useState({})
	const [read, setRead] = useState(false);
	const [acceptanceStatus, setAcceptanceStatus] = useState("");
	const [decision, setDecision] = useState("");
	const [comment, clearComment, handleCommentChange, setComment] = useFormInput("");
    const navigate = useNavigate();
	const dispatch = useDispatch();

	useEffect(() => {
		console.log("in JoinRequestMessage useEffect");
		console.log(sender);
		if(!sender) {
			console.log("no sender");
			(async () => {
				try {
					console.log("retrieving join request message")
					const messageRetrievalResponse = await axios.get(`${baseURL}/messages/${props.messageId}?type=JoinRequest`);
					let data = messageRetrievalResponse.data;
					console.log({data});
					setSender(data.sendingUser);
					setRead(data.read.includes(userId));
					setTargetGroup(data.targetGroup);
                    setAcceptanceStatus(data.acceptanceStatus);
				} catch (err) {
					console.error(err);
				}

			})();
		}
	}, []);

	const acceptUser = () => {
		setDecision("approved");
	}

	const denyUser = () => {
		setDecision("denied");
	}

	const submitUserDecision = () => {
		dispatch(makeJoinRequestDecision({messageId: props.messageId, decision, comment, decidingUserId: userId}))
			.then((response) => {
				console.log({response});
				console.log({payload: response.payload});
				if(!response.payload.sentMessage) {
					alert(`This user has already been ${response.payload.acceptanceStatus}`);
				} else if(response.payload.acceptanceStatus === "approved" && storedGroupId === targetGroup) {
					dispatch(addMember({groupId: targetGroup, userId}));
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
	
	if(!acceptanceStatus) {
		console.log("acceptance status not found");
		return (
			<></>
		);
	} else {
		console.log("acceptance status not found");
		
		return (
			<div>
                {props.fullView ? 
                    <div>
                        {props.direction === "received" ? <p>From: {sender.login.username || `${sender.name.first} ${sender.name.last}`}</p> : <p>To: {targetGroup.name} admins</p>}
                        <p><span>{sender.login.username}</span> would like to join: {targetGroup.name}</p>
                        {!decision ? 
                            userId !== sender._id && <><button onClick={acceptUser}>Accept</button><button onClick={denyUser}>Decline</button><button onClick={reviewUser}>View User</button></>
                            :
                            userId !== sender._id && 
                                <div>
                                    <textarea name="comments" id="comments" onChange={handleCommentChange} value={comment} placeholder="Add a comment (optional)"></textarea>
                                    <button className="btn btn-primary btn-md" onClick={submitUserDecision}>Submit decision to {decision === "approved" ? "approve" : "deny"} the request</button><button className="btn btn-danger btn-md" onClick={clearDecision}>Cancel</button>
                                </div>
                        }
                        
                        {userId !== sender._id}
                        
                    </div>
                    :
                    <div>
                        {props.direction === "received" ? <p>From: {sender.login.username || `${sender.name.first} ${sender.name.last}`}</p> : <p>To: {targetGroup.name} admins</p>}
                        <p><span>{read ? 'Read': 'Unread'}: </span><span>{sender.login.username || `${sender.name.first} ${sender.name.last}`}</span>would like to join: {targetGroup.name}</p>
                        <hr />
                    </div>
                }
            </div>
		)
	}
}

JoinRequestMessage.propTypes = {
    fullView: PropTypes.bool,
    messageId: PropTypes.string,
}


export default JoinRequestMessage;
