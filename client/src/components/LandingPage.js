import React from 'react';
import { Outlet } from 'react-router';

function LandingPage() {
	return (
		<div>
			<h1>Welcome!</h1>
			<Outlet />
		</div>
	)
}

export default LandingPage;