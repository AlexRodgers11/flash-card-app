import styled from "styled-components";
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router";

const StyledMdKeyboardBackspace = styled(MdKeyboardBackspace)`
    width: 1.5rem;
    height: 1.5rem;
    @media (max-width: 700px) {
        width: 1.25rem;
        height: 1.25rem;
    }
    @media (max-width: 450px) {
        width: .75rem;
        height: .75rem;
    }
`;

const StyledButton = styled.button`
    display: inline-flex;
    align-items: center;
    align-self: start;
    margin: 1rem;
    background-color: black !important;
    color: white;
    &:hover {
        color: #cfcfcf;
        background-color: #262626;
    }
    @media (max-width: 700px) {
        font-size: .75rem;
    }
    @media (max-width: 475px) {
        font-size: .6rem;
    }

    & svg {
        margin-right: .25rem;
    }
`;

export default function BackButton(props) {
    const navigate = useNavigate();
    
    const goBack = (evt) => {
        evt.stopPropagation();
        navigate(props.route);
    }

    return (
        <StyledButton className="btn btn-md" onClick={goBack}><StyledMdKeyboardBackspace />{props.children}</StyledButton>
    );
}