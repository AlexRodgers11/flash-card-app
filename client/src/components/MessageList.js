import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Message from './Message';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const MessageListWrapper = styled.div`
	display: flex;
	flex-direction: column;
`;

const ButtonGroup = styled.div`
	align-self: flex-start;
`;

const StyledButton = styled.button`
	padding: .25rem .5rem;
	margin: 0 .5rem 1rem 0;
	@media (max-width: 475px) {
		padding: .2rem .4rem;
		margin: 0 .4rem .8rem 0;
	}
	@media (max-width: 375px) {
		padding: .15rem .3rem;
		margin: 0 .25rem .5rem 0rem;
		font-size: .75rem;
	}
`;

function MessageList(props) {
	const userId = useSelector((state) => state.login.userId);
	const messages = useSelector((state) => state.communications.messages);	
	const [direction, setDirection] = useState('received');

	const selectDirection = evt => {
		evt.preventDefault();
		setDirection(evt.target.dataset.direction);
	}

	return (
		<MessageListWrapper>
			<ButtonGroup>
				<StyledButton data-direction="received" onClick={selectDirection}>Received</StyledButton>
				<StyledButton data-direction="sent" onClick={selectDirection}>Sent</StyledButton>
			</ButtonGroup>
			{messages[direction].map(message => <Message key={message._id} direction={direction} messageId={message._id} messageType={message.messageType} expandMessage={props.expandMessage} read={message.read.includes(userId)}/>)}
		</MessageListWrapper>
	)
}


export default MessageList