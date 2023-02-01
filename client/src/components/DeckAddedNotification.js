import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

const baseURL = 'http://localhost:8000';

const NavigationSpan = styled.span`
    font-weight: 600;
    cursor: pointer;
`;

function DeckAddedNotification(props) {
	const navigate = useNavigate();
	const [newDeck, setNewDeck] = useState();
    const [group, setGroup] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(loading) {
            (async () => {
                try {
                    const notificationRetrievalResponse = await axios.get(`${baseURL}/notifications/${props.notificationId}?type=DeckAdded`);
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
            <div>
                <p>Deck <NavigationSpan onClick={newDeck?._id && goToNewDeckPage}>{newDeck?.name || "Deleted Deck"}</NavigationSpan> was added to group <NavigationSpan onClick={group?._id && goToGroupPage}>{group?.name || "Deleted Group"}</NavigationSpan></p>
                <hr />
            </div>
        );
    }
}

DeckAddedNotification.propTypes = {
	hideModal:PropTypes.func,
	notificationId: PropTypes.string,
}

export default DeckAddedNotification
