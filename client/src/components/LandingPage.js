import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import Modal from './Modal';

function LandingPage() {
	const location = useLocation();
	const navigate = useNavigate();
		
	const goBackToHome = () => {
		navigate("/");
	};

	return (
		<div>
			<h1>Welcome!</h1>
				{location.pathname !== "/" && <Modal hideModal={location.pathname === "/register/credentials" ? goBackToHome : null}><Outlet /></Modal>}
		</div>
	)
}

export default LandingPage;