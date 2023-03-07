import styled from "styled-components";

export const MessagePreviewContent = styled.div`
    &:hover {
        background-color: black;
        color: white;
    }
    & p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        @media (max-width: 375px) {
            white-space: normal;
        }
        padding-right: .5rem;
    }
`;