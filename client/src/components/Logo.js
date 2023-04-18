import styled from "styled-components";
import { useSelector } from 'react-redux';

const LogoWrapper = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    // height: 52px;
    height: 5.5rem;
    // bottom: 2px;
    &:hover div{
        background-color: ${props => props.loggedIn ? "#171717" : "white"};
        border-color: ${props => props.loggedIn ? "#03ffff" : "171717"};
        border-width: 2px;
        color: ${props => props.loggedIn ? "#03ffff" : "#171717"};
        // background-color: #171717;
        // border-color: white;
        // color: white;
    }
    & div {
        position: relative;
        // display: flex;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        width: 42px;
        height: 56px;
        // width: 42px;
        // height: 52.125px;
        border: 1px solid black;
        background-color: white;
        border-radius: 6px;

        background-color: white; 
        border-color: #171717;
        border-width: 2px;
        color: #171717;

        // font-size: 0.6em;
        font-size: 0.7em;
        font-weight: 900;
        font-family: "Noto Sans Mono";
        color: black;
        &:first-of-type {
            z-index: 2;
            // margin-right: 36.5px;
            // bottom: 5px;
            bottom: 4px;
        }
        &:nth-of-type(2) {
            // bottom: 52px;
            top: 4px;
            right: 4px;
        }
    
`;

function Logo() {
    const userId = useSelector((state) => state.login.userId);

    return (
        <LogoWrapper loggedIn={Boolean(userId)} className="LogoWrapper">
            <div>Flish</div>
            <div>Flash</div>
        </LogoWrapper>
    )
}

export default Logo;