import styled from "styled-components";

export const MessageContentContainer = styled.div`
    width: 40rem;
    @media (max-width: 900px) {
        width: 30rem;
    }
    @media (max-width: 700px) {
        width: 20rem;
    }
    @media (max-width: 550px) {
        width: 15rem;
        font-size: .75rem;
    }
    @media (max-width: 375px) {
        width: 12rem;
        height: 3rem;
        display: flex;
        align-items: center;
    }
`;
