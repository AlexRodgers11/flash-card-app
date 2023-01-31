import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { addMemberSubmittedDeck } from '../reducers/decksSlice';
import { addActivity } from '../reducers/groupSlice';
import useFormInput from '../hooks/useFormInput';
import { makeDeckSubmissionDecision } from '../reducers/communicationsSlice';

const baseURL = 'http://localhost:8000';

function DeckSubmissionMessage(props) {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const userId = useSelector((state) => state.login.userId);
	const deckListType = useSelector((state) => state.decks.listType);
    const deckListId = useSelector((state) => state.decks.listId);
	const [sender, setSender] = useState({});
	const [targetDeck, setTargetDeck] = useState({});
    const [targetGroup, setTargetGroup] = useState({});
    const [deckName, setDeckName] = useState({});
	const [read, setRead] = useState(false);
	const [acceptanceStatus, setAcceptanceStatus] = useState("");
    const [decision, setDecision] = useState("");
	const [comment, clearComment, handleCommentChange, setComment] = useFormInput("");
    const [loading, setLoading] = useState(true);

    const acceptDeck = () => {
        setDecision("approved");
    }

    const denyDeck = () => {
        setDecision("denied");
    }

    const submitDeckDecision = () => {
        dispatch(makeDeckSubmissionDecision({messageId: props.messageId, decision, comment, decidingUserId: userId, groupId: targetGroup._id, deckId: targetDeck._id}))
            .then((response) => {
                console.log({payload: response.payload});
                if(!response.payload.sentMessage) {
                    alert(`This deck has already been ${response.payload.acceptanceStatus}`);
                } else if((response.payload.acceptanceStatus === "approved" && deckListType === "group") && deckListId === targetGroup._id) {
                    dispatch(addMemberSubmittedDeck({deckId: targetDeck._id}));
					// dispatch(addActivity({activityId: payload.newActivity, groupId: targetGroup._id}));
                }
                props.hideModal();
            });
        
    }

    const clearDecision = () => {
        setComment("");
        setDecision("");
    }

	const reviewDeck = () => {
		// props.hideModal();
		// navigate(`decks/${targetDeck._id}?review=true`);
	}

	useEffect(() => {
		if(loading) {
			(async () => {
				try {
					const messageRetrievalResponse = await axios.get(`${baseURL}/messages/${props.messageId}?type=DeckSubmission`);
					let data = messageRetrievalResponse.data;
                    console.log({data})
					setSender(data.sendingUser);
					setRead(data.read.includes(userId));
					setTargetGroup(data.targetGroup);
                    setTargetDeck(data.targetDeck);
                    setDeckName(data.deckName);
                    setAcceptanceStatus(data.acceptanceStatus);
                    setLoading(false);
				} catch (err) {
					console.error(err);
				}

			})();
		}
	}, [loading, props.messageId, userId]);
    
    if(loading) {
        return (
            <></>
        );
    } else {
        return (
            <div>
                {props.fullView ? 
                    <div>
                        {props.direction === "received" ? <p>From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {targetGroup.name} admins</p>}
                        <p><span>{sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</span> would like to add deck: {deckName} to <span>{targetGroup?.name || "deleted group"}</span></p>
                        {!decision ? 
                            userId !== sender._id && <><button onClick={acceptDeck}>Accept</button><button onClick={denyDeck}>Decline</button><button onClick={reviewDeck}>View Deck</button></>
                            :
                            userId !== sender._id && 
                                <div>
                                    <textarea name="comments" id="comments" onChange={handleCommentChange} value={comment} placeholder="Add a comment (optional)"></textarea>
                                    <button className="btn btn-primary btn-md" onClick={submitDeckDecision}>Submit decision to {decision === "approved" ? "approve" : "deny"} the request</button><button className="btn btn-danger btn-md" onClick={clearDecision}>Cancel</button>
                                </div>
                        }
                        
                        {userId !== sender._id}
                        
                    </div>
                    :
                    <div>
                        {props.direction === "received" ? <p>From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {targetGroup?.name || "deleted group"} admins</p>}
                        <p><span>{read ? 'Read': 'Unread'}:</span><span>{sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</span> would like to add deck: {deckName} to <span>{targetGroup?.name || "deleted group"}</span></p>
                        <hr />
                    </div>
                }
            </div>
        )
    }

}

DeckSubmissionMessage.propTypes = {
    fullView: PropTypes.bool,
    messageId: PropTypes.string,
}

export default DeckSubmissionMessage;
