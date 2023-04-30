import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import Modal from './Modal';
import styled, { keyframes } from 'styled-components';
import { useSelector } from 'react-redux';

// const NewLandingPageWrapper = styled.div`
// 	color: white;
// `;

// const MainSection = styled.div`
//     height: ${props => props.height};
//     min-height: 500px;
//     background-color: ${props => props.color};
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     grid-template-rows: 1fr;
//     height: calc(100vh - 5.5rem);
//     @media (max-width: 950px) {
//         grid-template-columns: 1fr;
//         // grid-template-rows: 1fr 1fr;
//         grid-template-rows: 5fr 2fr;
//     }
// `;

// const LoginControls = styled.div`	
// 	display: flex;
// 	flex-direction: column;
// 	align-items: center;
// 	justify-content: center;
// 	height: 100%;
// 	width: 100%;
// 	// background-color: cornflowerblue;
// 	// background-color: #0AFFED;
	

// 	// background-color: #FF6565;
//     // background-color: #9DE59D;
//     background-color: #52B2FF;
//     // background-color: #CC52CC;
// 	border-left: 1px solid black;
// 	& button {
// 		font-size: 2.5rem;
// 		width: 65%;
// 		height: 14vw;
// 		// width: 65%;
// 		// height: 20vw;
// 		max-height: 20vh;
// 		min-height: 3rem;
// 		margin: 1.5rem;
// 		// background-color: #223843;
// 		background-color: black;
// 		color: white;
// 		@media (max-width: 950px) {
// 			width: 25%;
// 			max-height: 25%;
// 			font-size: 1.25rem;
// 		}
// 		@media (max-width: 450px), (max-height: 450px) {
// 			font-size: 1rem;
// 			padding: .25rem .5rem;
// 		}
// 	}
// 	@media (max-width: 950px) {
// 		flex-direction: row;
// 	}
// `;

// const TitleBlock = styled.div`
//     display: flex;
// 	flex-direction: column;
// 	justify-content: center;
// 	align-items: center;
// 	width: 100%;
// 	height: 100%;
// 	background-color: #333333;
// `;

// const SiteTitle = styled.h1`
//     color: white;
//     font-size: 6rem;
// `;

// const Section = styled.section`
//     height: ${props => props.height};
//     min-height: 500px;
//     background-color: ${props => props.color}
// `;

// const SectionHeading = styled.h3`
//     color: white;
//     font-size: 4rem;
// `;

// //flip left horizontally for 1 second, wait 2 seconds- left backwards- 
//     //start at 0seconds
// //flip right vertically for 1 second, wait 2 seconds- right upside down
//     //start at 3 seconds
// //flip left vertically for 1 second, wait 2 seconds- left backwards and upside down 
//     //start at 9 seconds
// //flip right horizontally for 1 seconds, wait 2 seconds- right backwards and upside down
//     //start at 12 seconds
// //flip left horizontally for 1 second, wait 2 seconds- left upside down
//     //start at 15 seconds
// //flip right vertically for 1 second, wait 2 seconds- right backwards
//     //start at 18 seconds
// //flip left vertically for 1 second, wait 2 seconds- left in original position
//     //start at 21 seconds
// //flip right horizontally for 1 second, wait 2 seconds- right in original position
//     //start at 24 seconds
// //flip left horizontally for 1 second, wait 2 seconds- left backwards
//     //start at 27 seconds
// //flip left horizontally for 1 second, wait 2 seconds- left backwards- 
//     //start at 30 seconds
// //flip right vertically for 1 second, wait 2 seconds- right upside down
//     //start at 33 seconds
// //flip left vertically for 1 second, wait 2 seconds- left backwards and upside down 
//     //start at 36 seconds
// //flip right horizontally for 1 seconds, wait 2 seconds- right backwards and upside down
//     //start at 39 seconds
// //flip left horizontally for 1 second, wait 2 seconds- left upside down
//     //start at 42 seconds
// //flip right vertically for 1 second, wait 2 seconds- right backwards
//     //start at 45 seconds
// //flip left vertically for 1 second, wait 2 seconds- left in original position
//     //start at 48 seconds
// //flip right horizontally for 1 second, wait 2 seconds- right in original position
//     //start at 51 seconds
// //flip left horizontally for 1 second, wait seconds- left in original position
//     //



// const rotateCard1 = keyframes`
//     0% {
//         transform: rotateX(0deg) rotateY(0deg);//original
//     }
//     3.7%, 33.3% {
//         transform: rotateX(0deg) rotateY(180deg);//upside down
//     }
//     37%, 55.56% {
//         transform: rotateX(180deg) rotateY(180deg);//backward and upside down
//     }
//     59.26%, 77.78% {
//         transform: rotateX(180deg) rotateY(0deg);//backward
//     }
//     81.48%, 100% {
//         transform: rotateX(0deg) rotateY(0deg);//original
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

// const TitleCard = styled.div`
//     // display: inline-flex;
//     // z-index: 5;
//     position: relative;
//     display: inline-block;
//     // justify-content: center;
//     // align-items: center;
//     margin: 0 .5rem;
//     border: 2px solid black;
//     border-radius: 1.25rem;
//     background-color: white;
//     color: black;
//     width: 15rem;
//     height: 20rem;
//     &.first {
//         animation: ${rotateCard1} 24s infinite;
//     }
//     &.second {
//         animation: ${rotateCard2} 24s infinite;
//         animation-delay: 3s;
//     }
// `;

// const rotateCard1FrontText = keyframes`
//     0% {
//         transform: rotateX(0deg) rotateY(0deg);//original (front showing)
//     }
//     3.7%, 33.3% {
//         transform: rotateX(0deg) rotateY(180deg);//upside down (back showing)
//     }
//     37%, 55.56% {
//         transform: rotateX(180deg) rotateY(180deg);//backward and upside down (front showing)
//     }
//     59.26%, 77.78% {
//         transform: rotateX(180deg) rotateY(0deg);//backward (back showing)
//     }
//     81.48%, 100% {
//         transform: rotateX(0deg) rotateY(0deg);//original (front showing)
//     }
// `;

// const rotateCard2FrontText = keyframes`
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

// const Side = styled.div`
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     height: 100%;
//     width: 100%;
//     position: absolute;
//     backface-visibility: hidden;
    
// `;

// const CardFront = styled(Side)`
//     background-color: grey;
// `;

// const CardBack = styled(Side)`
//     z-index: -1;
//     transform: rotateY(180deg);
//     background-color: orange;
// `;


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

//flip left horizontally for 1 second, wait 2 seconds- left backwards- 
    //start at 0seconds
//flip right vertically for 1 second, wait 2 seconds- right upside down
    //start at 3 seconds
//flip left vertically for 1 second, wait 2 seconds- left backwards and upside down 
    //start at 9 seconds
//flip right horizontally for 1 seconds, wait 2 seconds- right backwards and upside down
    //start at 12 seconds
//flip left horizontally for 1 second, wait 2 seconds- left upside down
    //start at 15 seconds
//flip right vertically for 1 second, wait 2 seconds- right backwards
    //start at 18 seconds
//flip left vertically for 1 second, wait 2 seconds- left in original position
    //start at 21 seconds
//flip right horizontally for 1 second, wait 2 seconds- right in original position
    //start at 24 seconds
//flip left horizontally for 1 second, wait 2 seconds- left backwards
    //start at 27 seconds
//flip left horizontally for 1 second, wait 2 seconds- left backwards- 
    //start at 30 seconds
//flip right vertically for 1 second, wait 2 seconds- right upside down
    //start at 33 seconds
//flip left vertically for 1 second, wait 2 seconds- left backwards and upside down 
    //start at 36 seconds
//flip right horizontally for 1 seconds, wait 2 seconds- right backwards and upside down
    //start at 39 seconds
//flip left horizontally for 1 second, wait 2 seconds- left upside down
    //start at 42 seconds
//flip right vertically for 1 second, wait 2 seconds- right backwards
    //start at 45 seconds
//flip left vertically for 1 second, wait 2 seconds- left in original position
    //start at 48 seconds
//flip right horizontally for 1 second, wait 2 seconds- right in original position
    //start at 51 seconds
//flip left horizontally for 1 second, wait seconds- left in original position
    //



const rotate1 = keyframes`
    // 0%, 100% {
    0% {
        transform: rotateX(0deg) rotateY(0deg);//original
    }
    3.7%, 33.3% {
        transform: rotateX(0deg) rotateY(180deg);//upside down
    }
    37%, 55.56% {
        transform: rotateX(180deg) rotateY(180deg);//backward and upside down
    }
    59.26%, 77.78% {
        transform: rotateX(180deg) rotateY(0deg);//backward
    }
    81.48%, 100% {
        transform: rotateX(0deg) rotateY(0deg);//original
    }
`;

const rotate2 = keyframes`
    // 0%, 100% {
    0% {
        transform: rotateX(0deg) rotateY(0deg);//original
    }
    3.7%, 33.3% {
        transform: rotateX(180deg) rotateY(0deg);//upside down
    }
    37%, 55.56% {
        transform: rotateX(180deg) rotateY(180deg);//backward and upside down
    }
    59.26%, 77.78% {
        transform: rotateX(0deg) rotateY(180deg);//backward
    }
    81.48%, 100% {
        transform: rotateX(0deg) rotateY(0deg);//original
    }
`;

const TitleCard = styled.div`
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin: 0 .5rem;
    border: 2px solid black;
    border-radius: 1.25rem;
    background-color: white;
    color: black;
    width: 15rem;
    height: 20rem;
    &.first {
        animation: ${rotate1} 24s infinite;
    }
    &.second {
        animation: ${rotate2} 24s infinite;
        animation-delay: 3s;
    }
`;

const CardFront = styled.div`
    height: 100%;
    width: 100%;
`;

const CardBack = styled.div`
    height: 100%;
    width: 100%;
`;


function NewLandingPage() {
	const userId = useSelector((state) => state.login.userId);
	const accountSetupStage = useSelector((state) => state.login.accountSetupStage);
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
	});

	return (
		<NewLandingPageWrapper className="LandingPageWrapper">
            <MainSection color="red" height="100vh">
                <TitleBlock>git st
                    <SiteTitle>
                        <TitleCard className="first">
                            <CardFront>Flish</CardFront>
                            {/* <CardBack>Tlish</CardBack> */}
                        </TitleCard>
                        <TitleCard className="second">
                            <CardFront>Flash</CardFront>
                            {/* <CardBack>Flash</CardBack> */}
                        </TitleCard>
                    </SiteTitle>
                    <h4>A customizable flash card experience that lets you study smarter, shorter, and more efficiently</h4>
                </TitleBlock>
            <LoginControls className="LoginControls">
				<button onClick={openForm} data-location="login" className="btn btn-lg">Login</button>
				<button onClick={openForm} data-location="register/credentials" className="btn btn-lg">SignUp</button>
			</LoginControls>	
            </MainSection>
            <Section color="green" height="70vh">
                <SectionHeading>Create different types of cards: Flip, True/False, and Multiple Choice</SectionHeading>
            </Section>
            <Section color="orange" height="70vh">
                <SectionHeading>Browse public decks or create your own</SectionHeading>
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