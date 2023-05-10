import LinkedInLogo from "../logos/linked-in-logo.png"
import GitHubWordLogo from "../logos/github-text.png";
import GitHubLogo from "../logos/github-logo.png";
import ChaosZenGardenLogo from "../logos/chaos-zen-garden-logo.png";
import styled from "styled-components";
import { useNavigate } from "react-router";
import { openLinkInNewTab } from "../utils";
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const HireMeWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;    
    padding: 2rem;
    @media (max-width: 700px) {
        padding: 1rem;
    }
    @media (max-width: 575px) {
        padding: 0rem;
    }
`;

const Header = styled.p`
    width: 30rem;
    font-size: 1.5rem;
    font-weight: 600;
    padding-bottom: 2rem;
    text-align: left;
    @media (max-width: 700px) {
        width: 25rem;
        font-size: 1.25rem;
    }
    @media (max-width: 575px) {
        width: 15rem;
        font-size: 1rem;
    }
`;

const StyledButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border-radius: 2rem;
    padding: 1rem;
    padding: .75rem;
    margin-bottom: 1.75rem;
    outline: none;
    width: 20rem;
    height: 4rem;
    font-weight: 700;
    font-size: 1.5rem;
    @media (max-width: 700px) {
        width: 15rem;
        height: 3rem;
    }
    @media (max-width: 575px) {
        padding: .25rem;
    }
    &:hover {
        background-color: #e3e3e3;
    }
`;

const ButtonHeader = styled.p`
    font-size: 1.5rem;
    font-weight: 600;
    padding-bottom: .25rem;
`;

const StyledImage = styled.img`
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
`;

export function HireMe() {
    const navigate = useNavigate();

    const getResume = async () => {
        const response = await axios.get(`${baseURL}/resume`);
        console.log({resumeLink: response.data});
        openLinkInNewTab(response.data, navigate);
    }
    return (
        <HireMeWrapper>
            <Header>Thank you for your consideration! Below are some resources to get to know me and my work.</Header>
            <StyledButton onClick={getResume}>View My Resume</StyledButton>
            <StyledButton onClick={() => openLinkInNewTab("https://github.com/AlexRodgers11", navigate)}><StyledImage src={GitHubWordLogo} /><StyledImage src={GitHubLogo} /></StyledButton>
            <StyledButton onClick={() => openLinkInNewTab("https://www.linkedin.com/in/alex-rodgers-68b61a154/", navigate)}><StyledImage src={LinkedInLogo} /></StyledButton>
            <ButtonHeader>My Other Project</ButtonHeader>
            <StyledButton onClick={() => openLinkInNewTab("https://chaoszengarden.com", navigate)}><StyledImage src={ChaosZenGardenLogo} /></StyledButton>
            {/* <StyledButton onClick={() => openLinkInNewTab("https://chaoszengarden", navigate)}>
                <div>
                    <span style={{color: "#ff0048", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>C</span>
                    <span style={{color: "#44ff00", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>H</span>
                    <span style={{color: "#3e0eff", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>A</span>
                    <span style={{color: "#ffa30e", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>O</span>
                    <span style={{marginRight: '.25em', color: "#ff00fb", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>S</span>
                    <span style={{color: "#ffff00", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>Z</span>
                    <span style={{color: "#44ff00", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>E</span>
                    <span style={{marginRight: '.25em', color: "#3e0eff", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>N</span>
                    <span style={{color: "#ffa30e", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>G</span>
                    <span style={{color: "#ff00fb", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>A</span>
                    <span style={{color: "#ffff00", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>R</span>
                    <span style={{color: "#44ff00", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>D</span>
                    <span style={{color: "#3e0eff", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>E</span>
                    <span style={{color: "#ffa30e", textShadow:`-1.425px -1.425px 0 #000,1.425px -1.425px 0 #000,-1.425px 1.425px 0 #000,1.425px 1.425px 0 #000`}}>N</span>
                </div>
            </StyledButton> */}
        </HireMeWrapper>
    )
}