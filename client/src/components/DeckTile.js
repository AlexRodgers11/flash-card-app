import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import axios from "axios";
import { RxEyeOpen, RxEyeClosed } from "react-icons/rx";
import styled from 'styled-components';

const DeckTileWrapper = styled.div`
    display: inline-flex; 
    flex-direction: column;    
    text-align: center;  
    justify-content: center;
    position: relative;
    border: 2px solid black; 
    border-radius: 1rem; 
    height: 17rem; 
    width: 13rem; 
    margin: 1em;
    cursor: pointer;
`

const IndicatorsWrapper = styled.div`
    grid-column: span 1;
    position: absolute;
    top: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .75rem;
    paddingBottom: 0rem
`

const ContentWrapper = styled.p`
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-weight: 600;
    & img {
        height: 7rem;
        width: 100%;
    }
    & .large-name {
        font-size: 2rem;
    }
    & .medium-name {
        font-size: 1.5rem;
    }
`

const StyledOpenEye = styled(RxEyeOpen)`
    display: inline-block;
    justify-self: start;
    margin: 0rem;
`

const StyledClosedEye = styled(RxEyeClosed)`
    display: inline-block;
    justify-self: start;
    margin: 0rem;
`

const CardCountWrapper = styled.p`
    position: relative; 
    left: .5rem;
    display: inline-flex;
    align-items: center;
    justify-self: end;
    font-size: 1.25rem; 
    margin: 0rem;
    & span:nth-of-type(1) {
        padding-right: .1rem;
    }
    & span:nth-of-type(2) {
        position: relative; 
        bottom: .15rem;
        display: inline-block;
        height: 1rem;
        width: .8rem;
        border: 1px solid black;
        border-radius: .1rem; 
        opacity: 1; 
        z-index: 2;
        background-color: white;
    }
    & span:nth-of-type(3) {
        position: relative;
        top: .15rem;
        right: .5rem;
        display: inline-block;
        height: 1rem;
        width: .8rem;
        border: 1px solid black; 
        borderRadius: .1rem;
    }
`

const baseURL = 'http://localhost:8000';

function DeckTile(props) {
    const [deckData, setDeckData] = useState({});
    const location = useLocation();
    const navigate = useNavigate();

    const handleSelection = () => {
        //SEE IF OKAY TO DO THIS WAY- COULD BE UNSAFE AND ALLOW NAVIGATION TO PRIVATE DECKS
        if(location.pathname.slice(32, 33) === "d" || location.pathname.slice(1, 2) === "u") {
            navigate(`/decks/${props.deckId}`)
        } else if(location.pathname.slice(32, 33) === "p") {
            navigate(`/users/${deckData.creatorId}/decks/${props.deckId}/practice-session`);
        } else if(location.pathname.slice(1,2) === "g") {
            navigate(`/decks/${props.deckId}`);
        }
    }
    

    const handleKeyPress = (evt) => {
        if(evt.keyCode === 13) {
            handleSelection();
        }
    }

    useEffect(() => {
        axios.get(`${baseURL}/decks/${props.deckId}/tile`)
            .then((response) => setDeckData(response.data))
            .catch((err) => console.log(err));
    }, [props.deckId]);
  
    return (
        <DeckTileWrapper className="DeckTileWrapper" tabIndex={0} onKeyDown={handleKeyPress} onClick={handleSelection} >
            <IndicatorsWrapper className="IndictorsWrapper">
                {deckData.publiclyAvailable ? <StyledOpenEye size="1.25rem"/> : <StyledClosedEye size="1.25rem" />}
                <CardCountWrapper>
                    <span>{deckData.cardCount}</span>
                    <span />
                    <span />
                </CardCountWrapper>
            </IndicatorsWrapper>
            <ContentWrapper>
                {deckData.url && <img src={deckData.url} alt="profile-avatar"/>}
                <p className={deckData.url ? "medium-name" : "large-name"}>{deckData.name}</p>
            </ContentWrapper>
        </DeckTileWrapper>
    )
}

DeckTile.propTypes = {
    deckId: PropTypes.string
}

export default DeckTile
