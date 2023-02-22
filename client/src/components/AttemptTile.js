import React, { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import useShrinkingFont from "../hooks/useShrinkingFont";

const baseURL = 'http://localhost:8000';

const AttemptTileWrapper = styled(Link)`
    overflow: hidden;
    background-color: white;
    display: flex;
    width: 80%;
    height: 6rem;
    border: 1px solid black;
    border-radius: .5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.12);
    @media (max-width: 850px) {
        width: 90%;
    }
    @media (max-width: 450px) {
        width: 95%;
        border-radius: .75rem;
        flex-direction: column;
        height: 8rem;
    }
`;

const DateSection = styled.section`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: blue;
    border: 1px solid black;
    padding: .25rem;
    min-width: 35%;
    max-width: 35%;
    color: white;
    font-weight: 600;
    @media (max-width: 450px) {
        max-width: 100%;
        min-width: 100%;
        height: 40%;
    }
`;

const InfoSection = styled.div`
    display: flex;    
    justify-content: space-evenly;
    width: 60%;
    @media (max-width: 450px) {
        width: 100%;
        height: 60%;
    }
`;

const InfoBlock = styled.div`
    & p {
        display: flex;
        flex-direction: column;
        height: 50%;
        &:first-of-type {
            justify-content: flex-end;
            font-weight: 700;
            padding-bottom: 6%;
        }
        &:last-of-type {
            padding-top: 6%;
        }
        @media (max-width: 775px) {
            font-size: .75rem; 
        }
    }
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
`;

const breakpointsAndFonts = [
    {width: 0, fontSize: 24}, 
    {width: 450, fontSize: 24}, 
    {width: 775, fontSize: 30}, 
    {width: 1000, fontSize: 32}
];

function AttemptTile(props) {
    const [attemptData, setAttemptData] = useState({});
    const { userId } = useParams();

    const DateSectionRef = useRef();
    const ParagraphTagRef = useRef();

    const [fontSize, doneResizing] = useShrinkingFont(32, breakpointsAndFonts,DateSectionRef, ParagraphTagRef, attemptData.deckName);

    
    useEffect(() => {
        if(!attemptData.deckName) {
            axios.get(`${baseURL}/attempts/${props.attemptId}/tile`)
                .then((response) => {
                    setAttemptData(response.data);
                })
                .catch((err) => {
                    console.log(err.message);
                })
        }
    });

    if(!attemptData.deckName) {
        return <></>;
    }

    return (
        <AttemptTileWrapper to={`/users/${userId}/statistics/sessions/${props.attemptId}`} style={{opacity: doneResizing ? 1 : 0}}>
            <DateSection ref={DateSectionRef}>
            {/* come back and fix date */}
            <p ref={ParagraphTagRef} style={{fontSize: fontSize}}>{new Date(attemptData.datePracticed).toLocaleDateString()} 5:55PM</p>
            </DateSection>
            <InfoSection>
                <InfoBlock>
                    <p>Deck Practiced</p>
                    <p>{attemptData.deckName}</p>
                </InfoBlock>
                <InfoBlock>
                    <p>Accuracy Rate:</p>
                    <p>{attemptData.accuracyRate}%</p>
                </InfoBlock>
            </InfoSection>
        </AttemptTileWrapper>
    )
}

AttemptTile.propTypes = {
    attemptId: PropTypes.string
}

export default AttemptTile;