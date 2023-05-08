import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDecksOfGroup } from '../reducers/decksSlice';
import useFormInput from '../hooks/useFormInput';
import { makeCardSubmissionDecision } from '../reducers/communicationsSlice';
import { MessageContentContainer } from './StyledComponents/MessageContentContainer';
import { MessagePreviewContent } from './StyledComponents/MessagePreviewContent';
import { client } from '../utils';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function CardSubmissionMessage(props) {
	const dispatch = useDispatch();
	const userId = useSelector((state) => state.login.userId);
	const deckListType = useSelector((state) => state.decks.listType);
    const deckListId = useSelector((state) => state.decks.listId);
	const [sender, setSender] = useState();
    const [cardData, setCardData] = useState();
    const [targetDeck, setTargetDeck] = useState();
    const [targetGroup, setTargetGroup] = useState();
	const [read, setRead] = useState(false);
    const [decision, setDecision] = useState();
	const [comment, clearComment, handleCommentChange, setComment] = useFormInput("");
    const [loading, setLoading] = useState(true);

    const acceptCard = () => {
        setDecision("approved");
    }

    const denyCard = () => {
        setDecision("denied");
    }

    const submitCardDecision = () => {
        dispatch(makeCardSubmissionDecision({messageId: props.messageId, decision, comment}))
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

	useEffect(() => {
		if(loading) {
            console.log("loading");
			(async () => {
				try {
					const messageRetrievalResponse = await client.get(`${baseURL}/messages/${props.messageId}?type=CardSubmission`);
					let data = messageRetrievalResponse.data;
					setSender(data.sendingUser);
                    // setTargetCard(data.targetCard);
                    // setCardQuestion(data.cardQuestion);
                    //create a card when the card is submitted
                    ////can't delete the card on the back end when denied, or would still have to store ALL of the card info in the message so it would be able to always be displayed
                    //just store the info that would be used to create a card (in the message) when the card is submitted
                    ////front end will need to use logic to display what kind of card to show
                    ////back end PATCH for decision will need to create the card, not just push an existing one
                    setCardData(data.cardData);
					setRead(data.read.includes(userId));
                    setTargetDeck(data.targetDeck);
					setTargetGroup(data.targetGroup);
                    setLoading(false);
                    props.setMessageRendered(true);
				} catch (err) {
					console.error(err);
				}

			})();
		} else {
            console.log("not loading anymore");
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
                        <p><span>{sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</span> would like to add the following card to <span>{targetDeck?.name || "deleted deck"}</span> <span>{targetGroup?.name || "deleted group"}</span></p>
                        <br />
                        <p>Card Type: {cardData.cardType}</p>
                        <p>Question: {cardData.question}</p>
                        {cardData.hint && <p>Hint: {cardData.hint}</p>}
                        <p>CorrectAnswer: {cardData.correctAnswer}</p>
                        {cardData.cardType === "MultipleChoiceCard" && 
                            <>
                                <p>Wrong Answer One: {cardData.wrongAnswers[0]}</p>
                                <p>Wrong Answer Two: {cardData.wrongAnswers[1]}</p>
                                <p>Wrong Answer Three: {cardData.wrongAnswers[2]}</p>
                            </>
                        }

                        {!decision ? 
                            userId !== sender._id && <><button onClick={acceptCard}>Accept</button><button onClick={denyCard}>Decline</button></>
                            :
                            userId !== sender._id && 
                                <div>
                                    <textarea name="comments" id="comments" onChange={handleCommentChange} value={comment} placeholder="Add a comment (optional)"></textarea>
                                    <button className="btn btn-primary btn-md" onClick={submitCardDecision}>Submit decision to {decision === "approved" ? "approve" : "deny"} the request</button><button className="btn btn-danger btn-md" onClick={clearDecision}>Cancel</button>
                                </div>
                        }
                        
                        {userId !== sender._id}
                        
                    </div>
                    :
                    <MessagePreviewContent read={read} >
                        {props.direction === "received" ? <p>From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {targetGroup?.name || "deleted group"} admins</p>}
                        <p><span>{sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</span> would like to add a card to deck {targetDeck?.name || "deleted deck"} in <span>{targetGroup?.name || "deleted group"}</span></p>
                    </MessagePreviewContent>
                }
            </MessageContentContainer>
        )
    }

}

CardSubmissionMessage.propTypes = {
    fullView: PropTypes.bool,
    messageId: PropTypes.string,
    messageType: PropTypes.string,
    setMessageRendered: PropTypes.func
}

export default CardSubmissionMessage;
