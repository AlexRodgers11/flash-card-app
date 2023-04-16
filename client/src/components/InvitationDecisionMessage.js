import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { MessageContentContainer } from './StyledComponents/MessageContentContainer';
import { MessagePreviewContent } from './StyledComponents/MessagePreviewContent';
import { client } from '../utils';


const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function InvitationDecisionMessage(props) {
	const userId = useSelector((state) => state.login.userId);
	const [sender, setSender] = useState({});
    const [read, setRead] = useState(false);
    const [targetGroup, setTargetGroup] = useState({})
	const [acceptanceStatus, setAcceptanceStatus] = useState();
    const [loading, setLoading] = useState(true);

	useEffect(() => {
		if(loading) {
            (async () => {
                try {
					const messageRetrievalResponse = await client.get(`${baseURL}/messages/${props.messageId}?type=InvitationDecision`);
					let data = messageRetrievalResponse.data;
					setSender(data.sendingUser);
                    setRead(data.read.includes(userId));
					setTargetGroup(data.targetGroup);
                    setAcceptanceStatus(data.acceptanceStatus);
                    setLoading(false);
                    props.setMessageRendered(true);
				} catch (err) {
					console.error(err.message);
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
                        {props.direction === "received" ? 
                            <p>From: {sender?.login?.username || sender ? 
                                `${sender.name.first} ${sender.name.last}` 
                                : 
                                "deleted user"}
                            </p> 
                            : 
                            <p>To: {targetGroup?.name || "deleted group"} Admins</p>
                        }
                        <p><span>{read ? 'Read': 'Unread'}:</span><span>{sender.login.username}</span> {acceptanceStatus === "approved" ? "accepted" : "rejected"} your invitation to join group <span>{targetGroup?.name || "deleted group"}</span></p>
                    </div>
                    :
                    <MessagePreviewContent>
                        {props.direction === "received" ? 
                            <p>From: {sender?.login?.username || sender ? 
                                `${sender.name.first} ${sender.name.last}` 
                                : 
                                "deleted user"}
                            </p> 
                            : 
                            <p>To: {targetGroup?.name || "deleted group"} Admins</p>
                        }
                        <p><span>{read ? 'Read': 'Unread'}:</span><span>{sender.login.username}</span> {acceptanceStatus === "approved" ? "accepted" : "rejected"} your invitation to join group <span>{targetGroup?.name || "deleted group"}</span></p>
                    </MessagePreviewContent>
                }
            </MessageContentContainer>
        )
    }
}

InvitationDecisionMessage.propTypes = {
    fullView: PropTypes.bool,
    messageId: PropTypes.string,
    messageType: PropTypes.string,
    setMessageRendered: PropTypes.func
}

export default InvitationDecisionMessage;
