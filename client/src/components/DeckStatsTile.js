import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import styled from "styled-components";

const baseURL = 'http://localhost:8000';

const DeckStatsTileWrapper = styled(Link)`
    overflow: hidden;
    background-color: white;
    display: flex;
    width: 80%;
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
    }
`;

const NameSection = styled.section`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: blue;
    border: 1px solid black;
    padding: .25rem;
    width: 40%;
    color: white;
    font-weight: 600;
    &.vw-responsive {//make sure to make different class for large names and have it also be responsive at same breakpoints
        font-size: .75rem;

        @media (min-width: 450px) {
            font-size: 1.5rem;
        }
        @media (min-width: 775px) {
            font-size: 1.85rem;
        }
        @media (min-width: 1000px) {
            font-size: 2rem;
        }
        // @media (max-width: 1000px) {
        //     font-size: 1.85rem;
        // }
        // @media (max-width: 775px) {
        //     font-size: 1.5rem;
        // }
        // @media (max-width: 450px) {
        //     font-size: 1.25rem;
        // }
        // font-size: .75rem;
    }
`;

const InfoSection = styled.div`
    display: flex;    
    justify-content: space-evenly;
    width: 70%;
`;

const InfoBlock = styled.div`
    & p {
        display: flex;
        flex-direction: column;
        justify-content: center; 
        &:first-of-type {
            font-weight: 700;
        }
        @media (max-width: 775px) {
            font-size: .75rem; 
        }
    }
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
`;

function DeckStatsTile(props) {
    const [deckData, setDeckData]  = useState({});
    const [longDeckName, setLongDeckName] = useState(false);
    const { userId } = useParams();

    useEffect(() => {
        if(!deckData.deckName) {
            axios.get(`${baseURL}/decks/${props.deckId}/tile-stats`)
                .then((response) => {
                    setDeckData(response.data);
                    console.log(Math.max(response.data.deckName.split(" ").map(name => name.length)));
                    if(Math.max(response.data.deckName.split(" ").map(name => name.length)) > 10) {
                        setLongDeckName(true);
                        // console.log("too long");
                    }
                })
                .catch((err) => console.error(err.message));
        }
    }, [deckData.deckName, props.deckId]);
    
    if(!deckData.deckName) {
        return <></>;
    }

    return (
        <DeckStatsTileWrapper to={`/users/${userId}/statistics/sessions/decks/${props.deckId}`}>
                <NameSection className={`NameSection ${longDeckName ? "" : "vw-responsive"}`}><p style={{...(longDeckName && {fontSize: "1.25rem"}), wordBreak: longDeckName ? "break-all" : "normal"}}>{deckData.deckName}</p></NameSection>
                {/* come back and add font-shrinking useEffect here */}
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