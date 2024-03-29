import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDecksOfGroup } from '../reducers/decksSlice';
import useFormInput from '../hooks/useFormInput';
import { makeDeckSubmissionDecision } from '../reducers/communicationsSlice';
import { MessageContentContainer } from './StyledComponents/MessageContentContainer';
import { MessagePreviewContent } from './StyledComponents/MessagePreviewContent';
import { client } from '../utils';
import { useNavigate } from 'react-router';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function DeckSubmissionMessage(props) {
	const dispatch = useDispatch();
	const userId = useSelector((state) => state.login.userId);
	const deckListType = useSelector((state) => state.decks.listType);
    const deckListId = useSelector((state) => state.decks.listId);
	const [sender, setSender] = useState({});
    const [targetDeck, setTargetDeck] = useState({});
    const [targetGroup, setTargetGroup] = useState({});
    const [deckName, setDeckName] = useState({});
	const [read, setRead] = useState(false);
    const [decision, setDecision] = useState("");
	const [comment, clearComment, handleCommentChange, setComment] = useFormInput("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const acceptDeck = () => {
        setDecision("approved");
    }

    const denyDeck = () => {
        setDecision("denied");
    }

    const submitDeckDecision = () => {
        dispatch(makeDeckSubmissionDecision({messageId: props.messageId, decision, comment}))
            .then((response) => {
                if(!response.payload.sentMessage) {
                    alert(response.payload);
                } 
                if((response.payload.acceptanceStatus === "approved" && deckListType === "group") && deckListId === targetGroup._id) {
                    dispatch(fetchDecksOfGroup({groupId: targetGroup._id}));
                }
                props.hideModal();
            });
        
    }

    const clearDecision = () => {
        setComment("");
        setDecision("");
    }

	const reviewDeck = () => {
		props.hideModal();
		navigate(`decks/${targetDeck._id}/review?message=${props.messageId}&group=${targetGroup._id}`);
	}

	useEffect(() => {
		if(loading) {
			(async () => {
				try {
					const messageRetrievalResponse = await client.get(`${baseURL}/messages/${props.messageId}?type=DeckSubmission`);
					let data = messageRetrievalResponse.data;
					setSender(data.sendingUser);
					setRead(data.read.includes(userId));
					setTargetGroup(data.targetGroup);
                    setDeckName(data.deckName);
                    setTargetDeck(data.targetDeck);
                    setLoading(false);
                    props.setMessageRendered(true);
				} catch (err) {
					console.error(err);
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
                        {props.direction === "received" ? <p>From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {targetGroup.name} admins</p>}
                        <p><span>{sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</span> would like to add deck: {deckName} to <span>{targetGroup?.name || "deleted group"}</span></p>
                        {!decision ? 
                            userId !== sender._id && <><button disabled={!targetGroup?.name} onClick={acceptDeck}>Accept</button><button disabled={!targetGroup?.name} onClick={denyDeck}>Decline</button><button disabled={!targetGroup?.name} onClick={reviewDeck}>View Deck</button></>
                            :
                            userId !== sender._id && 
                                <div>
                                    <textarea name="comments" id="comments" onChange={handleCommentChange} value={comment} placeholder="Add a comment (optional)"></textarea>
                                    <button disabled={!targetGroup?.name} className="btn btn-primary btn-md" onClick={submitDeckDecision}>Submit decision to {decision === "approved" ? "approve" : "deny"} the request</button><button className="btn btn-danger btn-md" onClick={clearDecision}>Cancel</button>
                                </div>
                        }
                        
                        {userId !== sender._id}
                        
                    </div>
                    :
                    <MessagePreviewContent read={read} >
                        {props.direction === "received" ? <p>From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {targetGroup?.name || "deleted group"} admins</p>}
                        <p><span>{sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</span> would like to add deck: {deckName} to <span>{targetGroup?.name || "deleted group"}</span></p>
                    </MessagePreviewContent>
                }
            </MessageContentContainer>
        )
    }

}

DeckSubmissionMessage.propTypes = {
    fullView: PropTypes.bool,
    messageId: PropTypes.string,
    messageType: PropTypes.string,
    setMessageRendered: PropTypes.func
}

export default DeckSubmissionMessage;
