import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router';

const baseURL = 'http://localhost:8000';

function Message(props) {
	const navigate = useNavigate();
	const [messageType, setMessageType] = useState('');
	const [sender, setSender] = useState({});
	const [receiver, setReceiver] = useState({});
	const [target, setTarget] = useState({});
	const [content, setContent] = useState('');
	const [read, setRead] = useState(false);

	const expandMessage = () => {
		props.expandMessage(props.messageId);
	}
	
	const renderMessage = () => {
		switch(messageType) {
			case '':
				return null;
			case 'add-deck-request':
				return (
						<>
						{props.fullView ? 
							<div>
								<p><span>{sender.login.username}</span> would like to add deck: {target.name} to <span>{receiver.name}</span></p>
								<button>Accept</button><button>Decline</button><button onClick={reviewDeck}>View</button>
								
							</div>
							:
							<div>
								<p onClick={expandMessage}><span>{sender.login.username}</span> would like to add deck: {target.name} to <span>{receiver.name}</span></p>
								<hr />
							</div>
						}
						</>
				);
			default:
				return null;
		}
	}

	const reviewDeck = () => {
		props.hideModal();
		navigate(`decks/${target._id}?review=true`);
	}

	useEffect(() => {
		if(!messageType) {
			axios.get(`${baseURL}/messages/${props.messageId}`)
				.then((response) => {
					let message = response.data;
					setMessageType(message.type);
					let s = message.sendingUser || message.sendingGroup;
					setSender(s);
					let r = message.targetGroup;
					setReceiver(r);
					let t = message.targetDeck || message.targetCard || message.targetGroup;
					setTarget(t);					
					if(message.content) {
						setContent(message.content);
					}
					setRead(message.read);
				})
				.catch(err => {
					console.log(err);
				});
		}
	}, [messageType, props.messageId]);
	
	return (
		<div>{renderMessage()}</div>
	)
}

Message.propTypes = {
    messageId: PropTypes.string,
	expandMessage: PropTypes.func
}

export default Message
