import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import Modal from './Modal';
import styled, { keyframes } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { GiRapidshareArrow } from "react-icons/gi";
import axios from 'axios';
import { logout } from '../reducers/loginSlice';

const LandingPageWrapper = styled.div`
	color: white;
    width: 100vw;
    background-color: yellow;
`;

const MainSection = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    min-height: calc(100vh - 5.5rem);
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
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
    background-color: #52B2FF;
	border-left: 1px solid black;
	& button {
		font-size: 2.5rem;
		width: 65%;
		height: 14vw;
		max-height: 20vh;
		min-height: 3rem;
		margin: 1.5rem;
		background-color: black;
		color: white;
		@media (max-width: 1024px) {
			width: 25%;
			max-height: 25%;
			font-size: 1.25rem;
		}
		@media (max-width: 450px), (max-height: 450px) {
			font-size: 1rem;
			padding: .25rem .5rem;
		}
	}
	@media (max-width: 1024px) {
		flex-direction: row;
        border: none;
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
    & h4 {
        margin-top: 2rem;
        padding: 0 1rem;
        @media (max-width: 450px), (max-height: 450px) {
			font-size: 1rem;
		}
    }
`;

const SiteTitle = styled.div`
    min-width: 375px;
`;

const Section = styled.section`
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Georgia;
    font-family: 'Bookman Old Style', serif;
    min-width: 100vw;
    background-color: ${props => props.backgroundColor};
    color: ${props => props.color};
    padding: .75rem;
    @media (max-width: 450px) {
        font-size: .75rem;
    }
`;

const SectionHeading = styled.h3`
    font-size: 4rem;
    @media(max-width: 1350px) {
        font-size: 3.25rem;
    }
    @media (max-width: 1075px) {
        font-size: 2.75rem;
    }
    @media (max-width: 750px) {
        font-size: 2.25rem;
    }
    @media (max-width: 450px) {
        font-size: 2rem;
    }
`;

const SectionSubHeading = styled.p`
    text-align: left;
    align-self: center;
    font-size: 1.125em;
    font-weight: 500;
    font-style: italic;
    line-height: 1.25;
    padding: 1.25rem;
    width: 60%;
    @media (max-width: 1075px) {
        padding: 1rem;
        width: 65%;
    }
    @media (max-width: 750px) {
        padding: .75rem;
        width: 70%;
    }
    @media (max-width: 450px) {
        width: 90%;
    }
`;
const MiniSectionsContainer = styled.div`
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
`;

const MiniSection = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const MiniSectionHeading = styled.p`
    text-align: left;
    padding-top: .5rem;
`;

const List = styled.ul`

    text-align: left;
`;

const ListItem = styled.li`
    display: block;
    list-style-type: decimal;
    &:before {
        content: "- ";
    }
`;

const rotateCard1 = keyframes`
    0% {
        transform: rotateX(0deg) rotateY(0deg);
        -webkit-transform: rotateX(0deg) rotateY(0deg);
    }
    4.17%, 25% {
        transform: rotateX(0deg) rotateY(180deg);
        -webkit-transform: rotateX(0deg) rotateY(180deg);
    }
    29.17%, 50% {
        transform: rotateX(180deg) rotateY(180deg);
        -webkit-transform: rotateX(180deg) rotateY(180deg);
    }
    54.17%, 75% {
        transform: rotateX(180deg) rotateY(0deg);
        -webkit-transform: rotateX(180deg) rotateY(0deg);
    }
    79.17%, 100% {
        transform: rotateX(0deg) rotateY(0deg);
        -webkit-transform: rotateX(0deg) rotateY(0deg);
    }
`;

const rotateCard2 = keyframes`
    0% {
        transform: rotateX(0deg) rotateY(0deg);
        -webkit-transform: rotateX(0deg) rotateY(0deg);
    }
    4.17%, 25% {
        transform: rotateX(180deg) rotateY(0deg);
        -webkit-transform: rotateX(180deg) rotateY(0deg);
    }
    29.17%, 50% {
        transform: rotateX(180deg) rotateY(180deg);
        -webkit-transform: rotateX(180deg) rotateY(180deg);
    }
    54.17%, 75% {
        transform: rotateX(0deg) rotateY(180deg);
        -webkit-transform: rotateX(0deg) rotateY(180deg);
    }
    79.17%, 100% {
        transform: rotateX(0deg) rotateY(0deg);
        -webkit-transform: rotateX(0deg) rotateY(0deg);
    }
`;

const rotateCardFrontText = keyframes`
    0%, 8.33% {
        transform: rotateX(0deg) rotateY(0deg);
        -webkit-transform: rotateX(0deg) rotateY(0deg);
    }
    9%, 58.33% {
        transform: rotateX(180deg) rotateY(180deg);
        -webkit-transform: rotateX(180deg) rotateY(180deg);
    }
    59%, 100% {
        transform: rotateX(0deg) rotateY(0deg);
        -webkit-transform: rotateX(0deg) rotateY(0deg);
    }
`;

const rotateCardOneBackText = keyframes`
    0%, 33.33% {
        transform: rotateX(0deg) rotateY(0deg);
        -webkit-transform: rotateX(0deg) rotateY(0deg);
    }
    34%, 80% {
        transform: rotateX(180deg) rotateY(180deg);
        -webkit-transform: rotateX(180deg) rotateY(180deg);
    }
    81%, 100% {
        transform: rotateX(0deg) rotateY(0deg);
        -webkit-transform: rotateX(0deg) rotateY(0deg);
    }
`;

const rotateCardTwoBackText = keyframes`
    0%, 15% {
        transform: rotateX(180deg) rotateY(180deg);
        -webkit-transform: rotateX(180deg) rotateY(180deg);
    }
    16%, 80% {
        transform: rotateX(0deg) rotateY(0deg);
        -webkit-transform: rotateX(0deg) rotateY(0deg);
    }
    81%, 100% {
        transform: rotateX(180deg) rotateY(180deg);
        -webkit-transform: rotateX(180deg) rotateY(180deg);
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
    font-size: 6rem;
    font-weight: 500;
    color: black;
    width: 15rem;
    height: 20rem;
    @media (max-width: 550px) {
        width: 13.5rem;
        height: 18rem;
        font-size: 5.25rem;
    }
    @media (max-width: 470px) {
        width: 12rem;
        height: 16rem;
        font-size: 5rem;
    }
    @media (max-width: 420px) {
        width: 10.5rem;
        height: 14rem;
        font-size: 4.25rem;
    }
    @media (max-width: 370px) {
        width: 9rem;
        height: 12rem;
        font-size: 3.75rem;
    }
`;

// &.first {
//     animation: ${rotateCard1} 24s infinite;
//     -webkit-animation: ${rotateCard1} 24s infinite;
// }
// &.second {
//     animation: ${rotateCard2} 24s infinite;
//     -webkit-animation: ${rotateCard2} 24s infinite;
//     animation-delay: 3s;
//     -webkit-animation-delay: 3s;
// }

const Side = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    position: absolute;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
`;

const CardOneFront = styled(Side)`
    // animation: ${rotateCardFrontText} 24s infinite;
    // -webkit-animation: ${rotateCardFrontText} 24s infinite;
`;
const CardTwoFront = styled(Side)`
    // animation: ${rotateCardFrontText} 24s infinite;
    // -webkit-animation: ${rotateCardFrontText} 24s infinite;
    // animation-delay: 6s;
    // -webkit-animation-delay: 6s;
`;
    
// const CardOneBack = styled(Side)`
//     z-index: -1;
//     transform: rotateY(180deg);
//     -webkit-transform: rotateY(180deg);
// `;

// const CardTwoBack = styled(Side)`
//     z-index: -1;
//     transform: rotateY(180deg);
//     -webkit-transform: rotateY(180deg);
// `;

// const BackOneText = styled.div`
//     animation: ${rotateCardOneBackText} 24s infinite;
//     -webkit-animation: ${rotateCardOneBackText} 24s infinite;
// `;
// const BackTwoText = styled.div`
//     transform: rotateX(180deg) rotateY(180deg);
//     -webkit-transform: rotateX(180deg) rotateY(180deg);
//     animation: ${rotateCardTwoBackText} 24s infinite;
//     -webkit-animation: ${rotateCardTwoBackText} 24s infinite;
//     animation-delay: 6s;
//     -webkit-animation-delay: 6s;
// `;

const CardsContainer = styled.div`
    display: flex;
    justify-content: center;
    @media (max-width: 530px) {
        flex-direction: column;
    }
`;

const CardWrapper = styled.div`
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    display: inline-block;
    border: 3px solid black; 
    overflow: hidden;
    border-radius: 10%;
    background-color: #2C262C;
    width: 21rem;
    height: 24rem;
    margin: 0 2rem;
    @media (max-width: 1250px) {
        margin: 0 1.25rem;
    }
    @media (max-width: 1150px) {
        margin: 0 .75rem;
    }
    @media (max-width: 1075px) {
        width: 17.5rem;
        height: 20rem;
        margin: 0 .5rem;
    }
    @media (max-width: 900px) {
        width: 14rem;
        height: 16rem;
        margin: 0 .25rem;
    }
    @media (max-width: 690px) {
        font-size: .875rem;
        width: 10.5rem;
        height: 12rem;
    }
    @media (max-width: 530px) {
        display: block;
        width: 14rem;
        height: 16rem;
        margin-bottom: .5rem;
        align-self: center;
    }
    box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
`

const FlashCard = styled.div`
    position: relative;
    height: 100%;
    width: 100%;
    & button {
        padding: .5rem;
        font-size: 1rem;
        @media (max-width: 1015px) {
            padding: .375rem;
            font-size: .875rem;
        }
        @media (max-width: 690px) {
            font-size: .75rem
        }
	}
`;

const StyledFlipArrow = styled(GiRapidshareArrow)`
	height: 1.25rem;
	width: 1.25rem;
    margin-left: 5px;
    @media (max-width: 1015px) {
        font-size: 1rem;
    }
    @media (max-width: 690px) {
        font-size: .875rem
    }
    font-size: inherit
	transform: rotate(180deg);
	-webkit-transform: rotate(180deg);
`;

const QuestionBox = styled.div`
    position: relative;
	height: 40%;
	border-bottom: 1px solid black;
	background-color:  #2C262C;
    &.True-False {
        height: 46%;
    }
`

const QuestionWrapper = styled.div`
	display: flex;
    flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
    color: white;
    &.FlashCard {
        padding: 30% 5%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
`

const HintBox = styled.div`
	position: absolute;
    width: 100%;
	text-align: left;
	& button {
		margin: .5rem;
	}
	& p {
		display: inline-block;
		margin-left: .5rem;
		font-style: italic;
		font-size: .75rem 	;
		word-wrap: break-word;
		overflow-wrap: break-word; 
	}
`

const Answer = styled.div`
    display: flex;
    flex-shrink: 1;
    overflow: auto;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    background-color: white;
`;

const AnswerBox = styled.div`
	height: 60%;
    color: black;
    &.True-False {
        height: calc(54% - 1px);
    }
`

const AnswerWrapper = styled.div`
	height: 25%;
	border-bottom: .25px solid black;
	&:first-child {
		border-top: none;
	}
	&:last-child {
		border-bottom: none
	}
    &.True-False {
        height: 50%;
    }
`

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

function LandingPage() {
	const userId = useSelector((state) => state.login.userId);
	const accountSetupStage = useSelector((state) => state.login.accountSetupStage);
    const [publicDeckCount, setPublicDeckCount] = useState();
    const dispatch = useDispatch();
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

    const handleHideModal = () => {
        navigate("/");
        dispatch(logout());
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        localStorage.removeItem("token");
        localStorage.removeItem("persist:login");
    }

	useEffect(() => {
		if((userId && accountSetupStage === "complete") && (location.pathname !== "/register/profile-pic-crop" && location.pathname !== "/register/join-groups")) {
			navigate("/dashboard");
		}
	}, [userId, accountSetupStage, location, navigate]);

    
    const getPublicDeckCountInterval = useRef();

    useEffect(() => {
        if(!getPublicDeckCountInterval.current) {
            const getPublicDeckCount = async () => {
                const response = await axios.get(`${baseURL}/decks/public-count`);
                return response.data.deckCount;
            }

            getPublicDeckCount();

            getPublicDeckCountInterval.current = setInterval(async () => {
                const deckCount = await getPublicDeckCount();
                setPublicDeckCount(deckCount);
            }, 3000);
            
            return () => {
                clearInterval(getPublicDeckCountInterval.current);
            }
        }
    }, []);

	return (
		<LandingPageWrapper className="LandingPageWrapper">
            <MainSection>
                <TitleBlock>
                    <SiteTitle>
                        <TitleCard className="first">
                            <CardOneFront>Flish</CardOneFront>
                            {/* <CardOneBack><BackOneText>Flish</BackOneText></CardOneBack> */}
                        </TitleCard>
                        <TitleCard className="second">
                            <CardTwoFront>Flash</CardTwoFront>
                            {/* <CardTwoBack><BackTwoText>Flash</BackTwoText></CardTwoBack> */}
                        </TitleCard>
                    </SiteTitle>
                    <h4>A customizable flash card experience that lets you study smarter, shorter, and more efficiently</h4>
                </TitleBlock>
                <LoginControls className="LoginControls">
                    <button onClick={openForm} data-location="login" className="btn btn-lg">Login</button>
                    <button onClick={openForm} data-location="register/credentials" className="btn btn-lg">SignUp</button>
                </LoginControls>	
            </MainSection>
            <Section backgroundColor="black" color="white">
                <SectionHeading>Browse public decks or create your own</SectionHeading>
                {publicDeckCount && <p>{publicDeckCount} public decks and counting</p>}
            </Section>
            
            
            <Section  backgroundColor="#9DE59D" color="black">
                <SectionHeading>Create different types of cards: Flip, True/False, and Multiple Choice</SectionHeading>
                <CardsContainer>
                    <CardWrapper>
                        <FlashCard className="FlashCard">
                            <QuestionWrapper className="QuestionWrapper FlashCard">
                                How many bones are there in the human body?
                                <button className="btn btn-primary">View Answer<StyledFlipArrow /></button>
                            </QuestionWrapper>
                        </FlashCard>
                    </CardWrapper>
                    <CardWrapper>
                        <QuestionBox className="True-False">
                            <QuestionWrapper>Mount Everest is located in the Andes</QuestionWrapper>
                        </QuestionBox>
                        <AnswerBox className="True-False">
                            <AnswerWrapper  className="True-False"><Answer>True</Answer></AnswerWrapper>
                            <AnswerWrapper  className="True-False"><Answer>False</Answer></AnswerWrapper>
                        </AnswerBox>
                    </CardWrapper>
                    <CardWrapper>
                        <QuestionBox>
                            <QuestionWrapper>What is the hotest planet in the Milky Way?</QuestionWrapper>
                        </QuestionBox>
                        <AnswerBox>
                            <AnswerWrapper><Answer>Mercury</Answer></AnswerWrapper>
                            <AnswerWrapper><Answer>Venus</Answer></AnswerWrapper>
                            <AnswerWrapper><Answer>Mars</Answer></AnswerWrapper>
                            <AnswerWrapper><Answer>Jupiter</Answer></AnswerWrapper>
                        </AnswerBox>
                    </CardWrapper>
                </CardsContainer>
            </Section>

            
            
            <Section backgroundColor="#52B2FF" color="black" >
                <SectionHeading>Customize Practice Sessions for Personalized Learning</SectionHeading>

                <SectionSubHeading>Transform your study routine with our customizable practice sessions, designed to cater to your unique learning needs and preferences. With our flexible session options you can create a study session that perfectly aligns with your learning goals and time availability. Choose from:</SectionSubHeading>
                <MiniSectionsContainer>
                <MiniSection>
                    <MiniSectionHeading><strong>Full Deck Study</strong> Review all the cards in a deck for a comprehensive study session.</MiniSectionHeading>
                </MiniSection>
                <MiniSection>
                    <MiniSectionHeading><strong>Quick Practice</strong> Short on time? Select a specific number of cards for a quick review. You can choose from:</MiniSectionHeading>

                    <List>
                        <ListItem>Random cards for diverse learning.</ListItem>
                        <ListItem>Least recently practiced cards to refresh your memory.</ListItem>
                        <ListItem>Least practiced cards to ensure balanced learning.</ListItem>
                        <ListItem>Cards with the lowest accuracy to focus on challenging areas.</ListItem>
                        <ListItem>Newest created cards to keep up with fresh content.</ListItem>
                        <ListItem>Oldest created cards to revisit foundational knowledge.</ListItem>
                    </List>
                </MiniSection>
                <MiniSection>
                    <MiniSectionHeading><strong>Filtered Practice</strong> Want more control? Conduct a filtered session based on specific criteria:</MiniSectionHeading>
                    <List>
                        <ListItem>Type of card (Flip/Flash, Multiple Choice, True/False).</ListItem>
                        <ListItem>Accuracy rate to focus on cards that need more practice.</ListItem>
                        <ListItem>Date last practiced to revisit cards at the right time.</ListItem>
                        <ListItem>Date created to organize your learning chronologically.</ListItem>
                    </List>
                </MiniSection>
                </MiniSectionsContainer>

            </Section>

            <Section backgroundColor="black" color="white">
                <SectionHeading>Track Your Practice Session Stats to Keep Track of Your Progress</SectionHeading>
                <SectionSubHeading>Boost your learning efficiency by leveraging our statistics tracking feature and customizable study sessions. This allows you to:</SectionSubHeading>
                <MiniSectionsContainer>
                    <MiniSection>
                        <List>
                            <ListItem>Review past practice sessions, helping you to identify and focus on areas of improvement.</ListItem>
                            <ListItem>Analyze detailed statistics for individual decks, cards, and practice sessions to understand your learning progress and patterns.</ListItem>
                            <ListItem>Enjoy the flexibility to turn off statistics tracking at any point if you prefer a simpler learning approach.</ListItem>
                        </List>
                    </MiniSection>
                </MiniSectionsContainer>
            </Section>

            <Section backgroundColor="#FFD549" color="black">
                <SectionHeading>Collaborate and Share Resources in Study Groups</SectionHeading>
                <SectionSubHeading>Empower your learning experience by forming study groups, where members can share and contribute to each other's resources.</SectionSubHeading>
                <MiniSectionsContainer>
                    <MiniSection>
                        <MiniSectionHeading><strong>Members can</strong></MiniSectionHeading>
                        <List>
                            <ListItem>Submit personal decks to the group.</ListItem>
                            <ListItem>Create and contribute to existing group decks.</ListItem>
                        </List>
                    </MiniSection>
                    
                    <MiniSection>
                        <MiniSectionHeading><strong>Group Admin Privileges</strong></MiniSectionHeading>
                        {/* <p>Group admins have enhanced control, allowing them to:</p> */}
                        <List>
                            <ListItem>Approve or deny other users' deck and card submissions.</ListItem>
                            <ListItem>Directly submit their own decks and cards, bypassing the need for approval.</ListItem>
                            <ListItem>Invite new members or approve incoming join requests.</ListItem>
                        </List>
                    </MiniSection>

                    <MiniSection>
                        <MiniSectionHeading><strong>Flexible Join Options</strong></MiniSectionHeading>
                        {/* <p>Customize how new members join your group:</p> */}
                        <List>
                            <ListItem>Use a Group Join Code for effortless access.</ListItem>
                            <ListItem>Send invites from admin accounts to potential members.</ListItem>
                            <ListItem>Approve requests initiated by potential members themselves.</ListItem>
                        </List>
                    </MiniSection>
                </MiniSectionsContainer>
            </Section>


			{location.pathname !== "/" && <Modal hideModal={handleHideModal}><Outlet /></Modal>}
		</LandingPageWrapper>
	)
}

export default LandingPage;




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

