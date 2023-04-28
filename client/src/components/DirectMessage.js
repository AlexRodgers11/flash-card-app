import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { sendDirectMessage } from '../reducers/communicationsSlice';
import useFormInput from '../hooks/useFormInput';
import { MessageContentContainer } from './StyledComponents/MessageContentContainer';
import { MessagePreviewContent } from './StyledComponents/MessagePreviewContent';
import { client } from '../utils';
import useToggle from '../hooks/useToggle';
import styled from 'styled-components';

const BlockTextArea = styled.textarea`
    display: block;
    width: 100%;
    margin: 1rem 0;
`;

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function DirectMessage(props) {
	const dispatch = useDispatch();
	const userId = useSelector((state) => state.login.userId);
	const [sender, setSender] = useState({});
    const [receivingUser, setReceivingUser] = useState();
	const [read, setRead] = useState(false);
    const [text, setText] = useState("");
	const [replyText, clearReplyText, handleReplyTextChange, setReplyText] = useFormInput("");
    const [loading, setLoading] = useState(true);
    const [showReplyInput, toggleShowReplyInput] = useToggle(false);

    const handleCancelMessage = () => {
        clearReplyText();
        toggleShowReplyInput();
        props.toggleShowTrashIcon();
    }

    const handleOpenReply = () => {
        toggleShowReplyInput();
        props.toggleShowTrashIcon();
    }

    const handleSubmit = (evt) => {
        evt.preventDefault();
        dispatch(sendDirectMessage({senderId: userId, recipientId: sender._id, message: replyText}))
            .then(() => {
                props.hideModal();
            });
    }

	useEffect(() => {
		if(loading) {
			(async () => {
				try {
					const messageRetrievalResponse = await client.get(`${baseURL}/messages/${props.messageId}?type=DirectMessage`);
					let data = messageRetrievalResponse.data;
					setSender(data.sendingUser);
                    setReceivingUser(data.receivingUsers[0]);
                    setText(data.text);
					setRead(data.read.includes(userId));
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
                    !showReplyInput ?
                        <div>
                            {props.direction === "received" ? <p>From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {receivingUser?.login.username || receivingUser ? `${receivingUser.name.first} ${receivingUser.name.last}` : "deleted user"}</p>}
                            <p>{text}</p>
                            <button className="btn btn-primary btn-sm" onClick={handleOpenReply}>Reply</button>
                            
                        </div>
                        :
                        <div>
                            {props.direction === "received" ? <p>To: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>From: {receivingUser?.login.username || receivingUser ? `${receivingUser.name.first} ${receivingUser.name.last}` : "deleted user"}</p>}
                            <form onSubmit={handleSubmit}>
                                <BlockTextArea value={replyText} placeholder={`Type your reply here`} onChange={handleReplyTextChange} required cols="35" rows="10" autoComplete="off" autoFocus minLength={2} maxLength={3000} spellCheck={true}/>
                                <button type="submit" className="btn btn-primary btn-sm" >Send</button>
                                <button className="btn btn-danger btn-sm" onClick={handleCancelMessage}>Cancel</button>
                            </form>
                        </div>
                    :
                    <MessagePreviewContent read={read} >
                        {props.direction === "received" ? <p>From: {sender?.login?.username || sender ? `${sender.name.first} ${sender.name.last}` : "deleted user"}</p> : <p>To: {receivingUser?.login.username || receivingUser ? `${receivingUser.name.first} ${receivingUser.name.last}` : "deleted user"}</p>}
                        <p>{text.slice(0, 100)}</p>
                    </MessagePreviewContent>
                }
            </MessageContentContainer>
        )
    }

}

DirectMessage.propTypes = {
    fullView: PropTypes.bool,
    messageId: PropTypes.string,
    messageType: PropTypes.string,
    setMessageRendered: PropTypes.func
}

export default DirectMessage;
