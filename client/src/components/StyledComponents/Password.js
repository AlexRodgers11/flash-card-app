import styled from "styled-components";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

export const PasswordWrapper = styled.div`
    position: relative;
`;

export const StyledOpenEye = styled(AiOutlineEye)`
    position: absolute;
    right: 4%;
    top: 60%;
    cursor: pointer;
`;

export const StyledClosedEye = styled(AiOutlineEyeInvisible)`
    position: absolute;
    right: 4%;
    top: 60%;
    cursor: pointer;
`;


