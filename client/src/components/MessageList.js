import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Message from './Message';
import { useSelector } from 'react-redux';

function MessageList(props) {
	const userId = useSelector((state) => state.login.userId);
	const messages = useSelector((state) => state.communications.messages);	
	const [direction, setDirection] = useState('received');

	const selectDirection = evt => {
		evt.preventDefault();
		setDirection(evt.target.dataset.direction);
	}

	return (
		<div>
			<div>
				<button data-direction="received" onClick={selectDirection}>Received</button>
				<button data-direction="sent" onClick={selectDirection}>Sent</button>
			</div>
			{messages[direction].map(message => <Message key={message._id} direction={direction} messageId={message._id} messageType={message.messageType} expandMessage={props.expandMessage} read={message.read.includes(userId)}/>)}
		</div>
	)
}


export default MessageList