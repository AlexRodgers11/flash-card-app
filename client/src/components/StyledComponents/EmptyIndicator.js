import styled from "styled-components";

export const EmptyIndicator = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50vh;
    width: 80vw;
    min-width: 325px;
    border: 2px solid black;
    font-size: 4rem;
    margin-bottom: 4rem;
    @media (max-width: 750px) {
        font-size: 3.25rem;
    }
    @media screen and (max-width: 400px), (max-height: 600px) {
        font-size: 2.5rem;
    }
`;