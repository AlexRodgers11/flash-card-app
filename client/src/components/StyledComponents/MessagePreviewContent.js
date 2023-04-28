import styled from "styled-components";

export const MessagePreviewContent = styled.div.attrs({
    className: "MessagePreviewContent"
})`
    & p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        @media (max-width: 375px) {
            white-space: normal;
        }
        padding-right: .5rem;
    }
    background-color: ${props => props.read ? "#f2f2f2" : "white"};
    padding: ${props => props.read ? "0 1rem" : "0"};
    font-style: ${props => props.read ? "italic" : "normal"};
`;