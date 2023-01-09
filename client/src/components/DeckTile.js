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
        let letter = location.pathname.slice(32, 33)
        if(letter === "d") {
            navigate(`/decks/${props.deckId}`)
        } else if(letter === "p") {
            navigate(`/users/${deckData.creatorId}/decks/${props.deckId}/practice-session`);
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
            {/* This holds the eye and card count */}
            {/* <IndicatorsWrapper className="IndictorsWrapper" style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: ".75rem", paddingBottom: "0rem"}}> */}
            <IndicatorsWrapper className="IndictorsWrapper">
                {deckData.publiclyAvailable ? <StyledOpenEye size="1.25rem"/> : <StyledClosedEye size="1.25rem" />}
                <CardCountWrapper>
                    {/* <span style={{paddingRight: ".1rem"}}>{deckData.cardCount}</span> */}
                    <span>{deckData.cardCount}</span>
                    <span />
                    <span />
                </CardCountWrapper>
            </IndicatorsWrapper>
            {/* This holds the deck name */}
            <ContentWrapper>
                {deckData.url && <img src={deckData.url} alt="Deku" style={{height: "7rem", width: "100%"}} />}

                {deckData.url && <p>{deckData.name}</p>}
                {!deckData.url && <p style={{padding: "0 .25rem", margin: "0"}}>{deckData.name}</p>}
                {/* {deckData.url && <h5>{deckData.name}</h5>}
                {!deckData.url && <h1 style={{padding: "0 .25rem", margin: "0"}}>{deckData.name}</h1>} */}
            </ContentWrapper>
            {/* This provides offset to center the name */}
            {/* <p style={{margin: "0", paddingBottom: ".75rem", height: "2.6rem"}}></p> */}
        </DeckTileWrapper>
    )
}

DeckTile.propTypes = {
    deckId: PropTypes.string
}

export default DeckTile
