import styled from "styled-components";

const LogoWrapper = styled.div`
    position: relative;
    height: 52px;
    bottom: 2px;
    & div {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        width: 42px;
        height: 52.125px;
        border: 2px solid black;
        background-color: white;
        font-size: 0.6em;
        font-weight: 900;
        font-family: "Noto Sans Mono";
        color: black;
        &:first-of-type {
            z-index: 2;
            margin-right: 36.5px;
        }
        &:nth-of-type(2) {
            bottom: 46px;
            left: 36.5px;
        }
`;

function Logo() {
    return (
        <LogoWrapper>
            <div>Flish</div>
            <div>Flash</div>
        </LogoWrapper>
    )
}

export default Logo;