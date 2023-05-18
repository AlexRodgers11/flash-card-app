import styled from "styled-components";

export const ErrorMessage = styled.div.attrs({
    className: "ErrorMessage",
})`
    color: red;
    font-weight: 500;
    font-style: italic;
    padding-top: .5rem;
`;