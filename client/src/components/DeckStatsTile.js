import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import styled from "styled-components";
import useShrinkingFont from "../hooks/useShrinkingFont";
import { v4 as uuidv4 } from "uuid";

const baseURL = 'http://localhost:8000';

const DeckStatsTileWrapper = styled(Link)`
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

const NameSection = styled.section`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: blue;
    border: 1px solid black;
    padding: .25rem;
    min-width: 30%;
    max-width: 30%;
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
    width: 70%;
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

function DeckStatsTile(props) {
    const [deckData, setDeckData]  = useState({});
    const { userId } = useParams();

    const NameSectionRef = useRef();
    const ParagraphTagRef = useRef();
    const [fontSize, doneResizing] = useShrinkingFont(32, breakpointsAndFonts,NameSectionRef, ParagraphTagRef, deckData.deckName);

    useEffect(() => {
        if(!deckData.deckName) {
            axios.get(`${baseURL}/decks/${props.deckId}/tile-stats`)
                .then((response) => {
                    setDeckData(response.data);
                })
                .catch((err) => console.error(err.message));
        }
    }, [deckData.deckName, props.deckId]);
    
    if(!deckData.deckName) {
        return <></>;
    }

    return (
        <DeckStatsTileWrapper className="DeckStatsTileWrapper" to={`/users/${userId}/statistics/sessions/decks/${props.deckId}`} style={{opacity: doneResizing ? 1 : 0}} >
                <NameSection className="NameSection" ref={NameSectionRef} >
                    <p ref={ParagraphTagRef} style={{fontSize: fontSize}}>
                        {deckData.deckName.split(" ").map(word => <span key={uuidv4()} className="word">{word} </span>)}
                    </p>
                </NameSection>
                <InfoSection>
                    <InfoBlock>
                        <p>Accuracy Rate:</p> 
                        <p>{deckData.accuracyRate || "--"}%</p>
                    </InfoBlock>
                    <InfoBlock>
                        <p>Last practiced</p>
                        <p>{deckData.dateLastPracticed ? new Date(deckData.dateLastPracticed).toLocaleDateString() : "--"}</p>
                        {/* come back and look at possibly formatting date before it's stored in the database instead of converting here */}
                    </InfoBlock>
                    <InfoBlock>
                        <p>Times practiced:</p>
                        <p>{deckData.timesPracticed}</p>
                    </InfoBlock>

                </InfoSection>
        </DeckStatsTileWrapper>
    );
}

export default DeckStatsTile;