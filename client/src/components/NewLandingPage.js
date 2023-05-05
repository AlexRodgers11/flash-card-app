//flip left horizontally for 1 second, wait 2 seconds- left backwards- 
    //start at 0seconds ends at 1 second
//flip right vertically for 1 second, wait 2 seconds- right upside down
    //start at 3 seconds
//flip left vertically for 1 second, wait 2 seconds- left backwards and upside down 
    //start at 6 seconds ends at 7 seconds
//flip right horizontally for 1 seconds, wait 2 seconds- right backwards and upside down
    //start at 9 seconds
//flip left horizontally for 1 second, wait 2 seconds- left upside down
    //start at 12 seconds ends at 13 seconds
//flip right vertically for 1 second, wait 2 seconds- right backwards
    //start at 15 seconds
//flip left vertically for 1 second, wait 2 seconds- left in original position
    //start at 18 seconds ends at 19 seconds
//flip right horizontally for 1 second, wait 2 seconds- right in original position
    //start at 21 seconds
//flip left horizontally for 1 second, wait 2 seconds- left backwards
    //start at 24 seconds
//flip right vertically for 1 second, wait 2 seconds- left backwards- 
    //start at 27 seconds
//flip right vertically for 1 second, wait 2 seconds- right upside down
    //start at 30 seconds
//flip left vertically for 1 second, wait 2 seconds- left backwards and upside down 
    //start at 33 seconds
//flip right horizontally for 1 seconds, wait 2 seconds- right backwards and upside down
    //start at 36 seconds
//flip left horizontally for 1 second, wait 2 seconds- left upside down
    //start at 39 seconds
//flip right vertically for 1 second, wait 2 seconds- right backwards
    //start at 42 seconds
//flip left vertically for 1 second, wait 2 seconds- left in original position
    //start at 45 seconds
//flip right horizontally for 1 second, wait 2 seconds- right in original position
    //start at 48 seconds
//flip left horizontally for 1 second, wait seconds- left in original position
    //start at 51

    
//0 seconds-flip horizontal show back
//1 back-showing
//2 seconds (8.33%)- flip front text
//6 seconds- flip vertical show front
//7 front-showing
//12 seconds- flip horizontal show back
//13 back-showing
//14 seconds (58.33%)- flip front text
//18 seconds- flip vertical show front
//19 front-showing

//0 seconds-flip horizontal show back
//1 back-showing (correct)
//6 seconds- flip vertical show front
//7 front-showing
//8 seconds- flip back text
//12 seconds- flip horizontal show back
//13 back-showing
//18 seconds- flip vertical show front
//19 front-showing
//20 seconds- flip back text

// const rotateCard1 = keyframes`
//     0% {
//         transform: rotateX(0deg) rotateY(0deg); //(front correct) flip l/r blue to red
//     }
//     3.7%, 33.3% {
//         transform: rotateX(0deg) rotateY(180deg); //(back correct)
//         //need to flip both ways 
//     }
//     37%, 55.56% {
//         transform: rotateX(180deg) rotateY(180deg);//(front backward and upside down)
//     }
//     59.26%, 77.78% {
//         transform: rotateX(180deg) rotateY(0deg);//(back backward and upside down)
//     }
//     81.48%, 100% {
//         transform: rotateX(0deg) rotateY(0deg);//(front correct)
//     }
// `;

// const rotateCard2 = keyframes`
//     0% {
//         transform: rotateX(0deg) rotateY(0deg);//original
//     }
//     3.7%, 33.3% {
//         transform: rotateX(180deg) rotateY(0deg);//upside down
//     }
//     37%, 55.56% {
//         transform: rotateX(180deg) rotateY(180deg);//backward and upside down
//     }
//     59.26%, 77.78% {
//         transform: rotateX(0deg) rotateY(180deg);//backward
//     }
//     81.48%, 100% {
//         transform: rotateX(0deg) rotateY(0deg);//original
//     }
// `;

//step 0 (no flip) (front is correct)
//step 1 (flip l/r) (back is correct)
    //starts at 0% ends at 3.7%
//step 2 (flip u/d) (front is upside down and backward)
    //starts at 33.3% ends at 37%
//step 3 (flip l/r) (back is upside down and backward)
    //starts at 55.56% ends at 59.26%
//step 4 (flip u/d) (front is correct)
    //starts at 77.78% ends at 81.48%

//step 5 (flip l/r) (back is correct)
    //starts at 100% ends at 3.7%



import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import Modal from './Modal';
import styled, { keyframes } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

const NewLandingPageWrapper = styled.div`
	color: white;
`;

const MainSection = styled.div`
    height: ${props => props.height};
    min-height: 500px;
    background-color: ${props => props.color};
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    height: calc(100vh - 5.5rem);
    @media (max-width: 950px) {
        grid-template-columns: 1fr;
        // grid-template-rows: 1fr 1fr;
        grid-template-rows: 5fr 2fr;
    }
`;

const LoginControls = styled.div`	
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	width: 100%;
	// background-color: cornflowerblue;
	// background-color: #0AFFED;
	

	// background-color: #FF6565;
    // background-color: #9DE59D;
    background-color: #52B2FF;
    // background-color: #CC52CC;
	border-left: 1px solid black;
	& button {
		font-size: 2.5rem;
		width: 65%;
		height: 14vw;
		// width: 65%;
		// height: 20vw;
		max-height: 20vh;
		min-height: 3rem;
		margin: 1.5rem;
		// background-color: #223843;
		background-color: black;
		color: white;
		@media (max-width: 950px) {
			width: 25%;
			max-height: 25%;
			font-size: 1.25rem;
		}
		@media (max-width: 450px), (max-height: 450px) {
			font-size: 1rem;
			padding: .25rem .5rem;
		}
	}
	@media (max-width: 950px) {
		flex-direction: row;
	}
`;

const TitleBlock = styled.div`
    display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	background-color: #333333;
`;

const SiteTitle = styled.h1`
    color: white;
    font-size: 6rem;
`;

const Section = styled.section`
    height: ${props => props.height};
    min-height: 500px;
    background-color: ${props => props.color}
`;

const SectionHeading = styled.h3`
    color: white;
    font-size: 4rem;
`;

const rotateCard1 = keyframes`
    0% {
        transform: rotateX(0deg) rotateY(0deg); //(front correct) flip l/r blue to red
    }
    4.17%, 25% {
        transform: rotateX(0deg) rotateY(180deg); //(back correct)
    }
    29.17%, 50% {
        transform: rotateX(180deg) rotateY(180deg);//(front backward and upside down)
    }
    54.17%, 75% {
        transform: rotateX(180deg) rotateY(0deg);//(back backward and upside down)
    }
    79.17%, 100% {
        transform: rotateX(0deg) rotateY(0deg);//(front correct)
    }
`;

const rotateCard2 = keyframes`
    0% {
        transform: rotateX(0deg) rotateY(0deg); //(front correct) flip l/r blue to red
    }
    4.17%, 25% {
        transform: rotateX(180deg) rotateY(0deg); //(back correct)
    }
    29.17%, 50% {
        transform: rotateX(180deg) rotateY(180deg);//(front backward and upside down)
    }
    54.17%, 75% {
        transform: rotateX(0deg) rotateY(180deg);//(back backward and upside down)
    }
    79.17%, 100% {
        transform: rotateX(0deg) rotateY(0deg);//(front correct)
    }
`;

const TitleCard = styled.div`
    position: relative;
    display: inline-block;
    transform-style: preserve-3d;
    margin: 0 .5rem;
    border: 2px solid black;
    border-radius: 1.25rem;
    background-color: white;
    color: black;
    width: 15rem;
    height: 20rem;
    &.first {
        animation: ${rotateCard1} 24s infinite;
    }
    &.second {
        animation: ${rotateCard2} 24s infinite;
        animation-delay: 3s;
    }
`;

const rotateCardFrontText = keyframes`
    0%, 8.33% {
        transform: rotateX(0deg) rotateY(0deg);
    }
    9%, 58.33% {
        transform: rotateX(180deg) rotateY(180deg);
    }
    59%, 100% {
        transform: rotateX(0deg) rotateY(0deg);
    }
`;

const rotateCardOneBackText = keyframes`
    0%, 33.33% {
        transform: rotateX(0deg) rotateY(0deg);
    }
    34%, 80% {
        transform: rotateX(180deg) rotateY(180deg);
    }
    81%, 100% {
        transform: rotateX(0deg) rotateY(0deg);
    }
`;

const rotateCardTwoBackText = keyframes`
    0%, 15% {
        transform: rotateX(180deg) rotateY(180deg);
    }
    16%, 80% {
        transform: rotateX(0deg) rotateY(0deg);
    }
    81%, 100% {
        transform: rotateX(180deg) rotateY(180deg);
    }
`;

const Side = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    position: absolute;
    backface-visibility: hidden;
    
`;

const CardOneFront = styled(Side)`
    animation: ${rotateCardFrontText} 24s infinite;
`;
const CardTwoFront = styled(Side)`
    animation: ${rotateCardFrontText} 24s infinite;
    animation-delay: 6s;
`;
    
const CardOneBack = styled(Side)`
    z-index: -1;
    transform: rotateY(180deg);

`;

const CardTwoBack = styled(Side)`
    z-index: -1;
    transform: rotateY(180deg);
`;

const BackOneText = styled.div`
    animation: ${rotateCardOneBackText} 24s infinite;
`;
const BackTwoText = styled.div`
    transform: rotateX(180deg) rotateY(180deg);
    animation: ${rotateCardTwoBackText} 24s infinite;
    animation-delay: 6s;
`;

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

function NewLandingPage() {
	const userId = useSelector((state) => state.login.userId);
	const accountSetupStage = useSelector((state) => state.login.accountSetupStage);
    const [publicDeckCount, setPublicDeckCount] = useState();
	const location = useLocation();
	const navigate = useNavigate();
	
	const openForm = evt => {
		evt.preventDefault();
		if(evt.target.dataset.location === "login") {
			navigate("/login");
		} else {
			navigate("/register/credentials");
		}
	}

	const goBackToHome = () => {
		navigate("/");
	};

	useEffect(() => {
		if(userId && accountSetupStage === "complete") {
			navigate("/dashboard");
		}
	}, [userId, accountSetupStage, navigate]);

    
    const getPublicDeckCountInterval = useRef();

    useEffect(() => {
        if(!getPublicDeckCountInterval.current) {
            const getPublicDeckCount = async () => {
                const response = await axios.get(`${baseURL}/decks/public-count`);
                return response.data.deckCount;
            }

            getPublicDeckCountInterval.current = setInterval(async () => {
                const deckCount = await getPublicDeckCount();
                setPublicDeckCount(deckCount);
            }, 3000);
            
            return () => {
                clearInterval(getPublicDeckCountInterval.current);
            }
        }
    }, []);

    if(!publicDeckCount) {
        return <></>;
    }

	return (
		<NewLandingPageWrapper className="LandingPageWrapper">
            <MainSection color="red" height="100vh">
                <TitleBlock>
                    <SiteTitle>
                        <TitleCard className="first">
                            <CardOneFront>Flish</CardOneFront>
                            <CardOneBack><BackOneText>Flish</BackOneText></CardOneBack>
                        </TitleCard>
                        <TitleCard className="second">
                            <CardTwoFront>Flash</CardTwoFront>
                            <CardTwoBack><BackTwoText>Flash</BackTwoText></CardTwoBack>
                        </TitleCard>
                    </SiteTitle>
                    <h4>A customizable flash card experience that lets you study smarter, shorter, and more efficiently</h4>
                </TitleBlock>
            <LoginControls className="LoginControls">
				<button onClick={openForm} data-location="login" className="btn btn-lg">Login</button>
				<button onClick={openForm} data-location="register/credentials" className="btn btn-lg">SignUp</button>
			</LoginControls>	
            </MainSection>
            <Section color="black" height="70vh">
                <SectionHeading>Create different types of cards: Flip, True/False, and Multiple Choice</SectionHeading>
            </Section>
            <Section color="orange" height="70vh">
                <SectionHeading>Browse public decks or create your own</SectionHeading>
                <p>{publicDeckCount} public decks and counting</p>
            </Section>
            <Section color="blue" height="70vh">
                <SectionHeading>Form study groups and share resources</SectionHeading>    
            </Section>
            <Section color="pink" height="70vh">
                <SectionHeading>Track statistics and customize study sessions for more efficient learning</SectionHeading>    
            </Section>

			{location.pathname !== "/" && <Modal hideModal={location.pathname === "/register/credentials" || location.pathname === "/login" ? goBackToHome : null}><Outlet /></Modal>}
		</NewLandingPageWrapper>
	)
}

export default NewLandingPage;