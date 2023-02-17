import styled from "styled-components";

export const GroupWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    & section {
        width: 100%;
    }
`;


export const TitleSection = styled.section`
    background-color: #454545;
    color: white;
`;

export const GroupSection = styled.section`
    display: flex; 
    width: 100%;
    flex-direction: column;
    align-items: center;
    background-color: #E08585;
    // margin-bottom: 3rem;
`;

export const DeckSection = styled.section`
    background-color: #5197E1;
    width: 100%;
`;

export const DeckOptionContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    & p {
        width: 250px;
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 1rem;
        @media (max-width: 400px) {
            width: 200px;
            font-size: .9rem;
        }
    }
`;

export const DeckOption = styled.div`
    width: 250px;
    border: 1px solid black;
    margin-bottom: .25rem;
    padding: .15rem;
    cursor: pointer;
    @media (max-width: 400px) {
        width: 200px;
        font-size: .75rem;
    }
`;

export const GroupMemberOptionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    & p {
        width: 250px;
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 1rem;
        @media (max-width: 400px) {
            width: 200px;
            font-size: .9rem;
        }
    }
`;

export const JoinOptionContainer = styled.div`
    display: inline-block;
    margin-bottom: 3.75rem;
    & label {
        margin-right: .5rem;
    }
    & select {
        display: inline-block;
        padding: .275rem .55rem;
        margin-bottom: .25rem;
    }
    @media (max-width: 500px) {
        font-size: .85rem;
    }
`;

export const GroupEditControlsContainer = styled.div`
    display: inline-block;
    & button {
        display: inline-block;
        margin: 1rem .25rem;
    }
`;

export const JoinCodeContainer = styled.div`
    // margin-bottom: 3rem;
    & button {
        display: inline-block;
    }
`;

export const Heading = styled.p`
    margin: 2rem;
    font-size: 3.5rem;
    font-weight: 600;
    @media (max-width: 500px) {
        margin: 1rem;
        font-size: 1.5rem;
    }
`;

export const SubHeading = styled.p`
    font-size: 2.25rem;
    margin-bottom: 1rem !important;
    @media (max-width: 500px) {
        margin-bottom: .5rem !important;
        font-size: 1.25rem;
        font-weight: 500;
    }
`;