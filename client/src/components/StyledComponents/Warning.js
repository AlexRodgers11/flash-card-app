import styled from "styled-components";

export const WarningMessage = styled.h3`
    max-width: 65vw;
    @media (max-width: 600px) {
        font-size: 1.25rem;
    }
    @media (max-width: 450px) {
        font-size: 1rem;
    }
`;

export const WarningButtonsWrapper = styled.div`
    margin-top: 1.5rem;
    @media (max-width: 600px) {
        margin-top: 1rem;
    }
    & button {
        margin: 0 .75rem;
        padding: .5rem 1rem;
        @media (max-width: 600px) {
            margin: 0 .25rem;
            padding: .25rem .5rem;
        }
        @media (max-width: 450px) {
            font-size: .875rem;
            margin: 0 .125rem;
            padding: .125rem .25rem;
        }
    }
`;