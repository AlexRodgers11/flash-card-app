import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { client } from '../utils';
import { useNavigate } from 'react-router';
import { NavigationSpan } from './StyledComponents/NavigationSpan';
import { NotificationContentContainer } from './StyledComponents/NotificationContentContainer';

const baseURL = 'http://localhost:8000';

function DeckAddedNotification(props) {
	const navigate = useNavigate();
	const [newDeck, setNewDeck] = useState();
    const [group, setGroup] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(loading) {
            (async () => {
                try {
                    const notificationRetrievalResponse = await client.get(`${baseURL}/notifications/${props.notificationId}?type=DeckAdded`);
                    setNewDeck(notificationRetrievalResponse.data.targetDeck);
                    setGroup(notificationRetrievalResponse.data.targetGroup);
                    setLoading(false);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    }, [loading, props.notificationId]);


    const goToNewDeckPage = () => {
        navigate(`/decks/${newDeck._id}`);
        props.hideModal();
    }

    const goToGroupPage = () => {
        navigate(`/groups/${group._id}`);
        props.hideModal();
    }
	
    if(loading) {
        return <>Loading</>
    } else {
        return (
            <NotificationContentContainer>
                <p>Deck <NavigationSpan onClick={newDeck?._id && goToNewDeckPage}>{newDeck?.name || "Deleted Deck"}</NavigationSpan> was added to group <NavigationSpan onClick={group?._id && goToGroupPage}>{group?.name || "Deleted Group"}</NavigationSpan></p>
            </NotificationContentContainer>
        );
    }
}

DeckAddedNotification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string,
}

export default DeckAddedNotification
