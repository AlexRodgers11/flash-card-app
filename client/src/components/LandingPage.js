import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import Modal from './Modal';
import styled from 'styled-components';

const LandingPageWrapper = styled.div`
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
	background-color: cornflowerblue;
	border-left: 1px solid black;
	& button {
		font-size: 2.5rem;
		width: 65%;
		height: 20vw;
		max-height: 20vh;
		min-height: 3rem;
		margin: 1rem;
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

const CarouselWrapper = styled.div`	
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
	background-color: slategray;
	& div.carousel.slide  {
		width: 100%;
		height: 50vmin;
		@media (max-width: 950px) {
			height: 70vmin;
			// @media(max-height: 400px) {
			// 	height: 50vmin;
			// }
		}
	}
	& div.carousel-inner {
		width: 100%;
	}
	& button.indicator {
		width: 10px;
		height: 10px;
		background-color: gray;
		border-radius: 50%;
	}
`;


const StyledImage = styled.img`
	width: 50vmin;
	height: 50vmin;
	object-fit: contain;
	@media (max-width: 950px) {
		height: 70vmin;
		width: 70vmin;
		// @media(max-height: 400px) {
		// 	height: 50vmin;
		// 	width: 50vmin;
		// }
	}
`;


function LandingPage() {
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

	return (
		<LandingPageWrapper className="LandingPageWrapper">
			<CarouselWrapper className="CarouselWrapper">
				{/* <div id="carouselExampleControls" class="carousel slide" data-bs-ride="carousel">
					<div class="carousel-indicators">
						<button type="button" className="indicator active" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" aria-current="true" aria-label="Slide 1"></button>
						<button type="button" className="indicator" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1" aria-label="Slide 2"></button>
						<button type="button" className="indicator" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2" aria-label="Slide 3"></button>
					</div>
					<div class="carousel-inner">
						<div class="carousel-item active">
							<StyledImage src="..." class="d-block w-100" alt="..." />
						</div>
						<div class="carousel-item">
							<StyledImage src="..." class="d-block w-100" alt="..." />
						</div>
						<div class="carousel-item">
							<StyledImage src="..." class="d-block w-100" alt="..." />
						</div>
					</div>
					<button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
						<span class="carousel-control-prev-icon" aria-hidden="true"></span>
						<span class="visually-hidden">Previous</span>
					</button>
					<button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
						<span class="carousel-control-next-icon" aria-hidden="true"></span>
						<span class="visually-hidden">Next</span>
					</button>
				</div> */}
			</CarouselWrapper>
			<LoginControls className="LoginControls">
				<button onClick={openForm} data-location="login" className="btn btn-lg btn-primary">Login</button>
				<button onClick={openForm} data-location="register/credentials" className="btn btn-lg btn-success">SignUp</button>
			</LoginControls>		
			{location.pathname !== "/" && <Modal hideModal={location.pathname === "/register/credentials" || location.pathname === "/login" ? goBackToHome : null}><Outlet /></Modal>}
		</LandingPageWrapper>
	)
}

export default LandingPage;