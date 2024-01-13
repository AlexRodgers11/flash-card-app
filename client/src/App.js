import Header from './components/Header';
import Router from './components/Router';
import styled from 'styled-components';
import Footer from './components/Footer';
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import { logout } from './reducers/loginSlice';
import { addMultipleEventListeners, removeMultipleEventListeners } from './utils';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

if(process.env.NODE_ENV === "production") {
	disableReactDevTools();
}

const AppWrapper = styled.div`
	text-align: center;
	position: relative;
	height: 100%;
	width: 100%;
	user-select: none;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	& h1, h2, h3, h4, h5, h6, p {
	  margin-bottom: 0;
	}
	& a, a:hover {
		text-decoration: none;
		color: inherit
	}
	& * {
		// margin-block-start: 0;
		// margin-block-end: 0;
		// margin-inline-start: 0;
		// margin-inline-end: 0;
	}
	& *::marker {
		content: none;
	}
`

const HeaderContainer = styled.section`
	height: 5.5rem
`

const MainContainer = styled.section`
	min-height: calc(100vh - 5.5rem); 
	// height: calc(100vh - 5.5rem);
`

const FooterContainer = styled.section`
`


function App() {
	const userId = useSelector((state) => state.login.userId);
	const inactivityLengthBeforeLogout = useSelector((state) => state.login.inactivityLengthBeforeLogout);
	const dispatch = useDispatch();
	
	useEffect(() => {
		if(inactivityLengthBeforeLogout && inactivityLengthBeforeLogout !== "never") {
			console.log({inactivityLengthBeforeLogout});
			
			const executeSessionTimeout = () => {
				if(userId) {
					dispatch(logout());
					document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
					localStorage.removeItem("token");
					localStorage.removeItem("persist:login");
					localStorage.removeItem("persist:communications");
					localStorage.removeItem("persist:practiceSession");
					window.location.reload();
					alert("You have been logged out due to inactivity");
				}
			}

			const handleEventFiring = () => {
				if(userId) {
					if(!isHandlingEvent) {
						isHandlingEvent = true;
						console.log("activity occurred");
						resetLogoutTimer();
						isHandlingEvent = false;
					}
				}
			}
			
			let logoutTimer = setTimeout(executeSessionTimeout, inactivityLengthBeforeLogout || 3600000);
			
			let debounceTimer;
		
			let isHandlingEvent = false;
			
			const resetLogoutTimer = () => {
				clearTimeout(debounceTimer);
				clearTimeout(logoutTimer);
				removeMultipleEventListeners(window, ["mouseup", "scroll", "keyup", "touchstart"], handleEventFiring);
				debounceTimer = setTimeout(() => {
					console.log("debounce timer reset");
					addMultipleEventListeners(window, ["mouseup", "scroll", "keyup", "touchstart"], handleEventFiring);
					logoutTimer = setTimeout(executeSessionTimeout, inactivityLengthBeforeLogout || 3600000);
					// logoutTimer = setTimeout(executeSessionTimeout, 5000);
				}, 90000);
				// }, 2000);
			}
		
			
		
			addMultipleEventListeners(window, ["mouseup", "scroll", "keyup", "touchstart"], handleEventFiring);
			return () => {
				removeMultipleEventListeners(window, ["mouseup", "scroll", "keyup", "touchstart"], handleEventFiring);
			}
		}
	}, [inactivityLengthBeforeLogout, dispatch, userId]);
	

	return (
		<AppWrapper className="App">
			<HeaderContainer className="HeaderContainer">
				<Header />
			</HeaderContainer>
			<MainContainer>
				<Router />
			</MainContainer>
			<FooterContainer>
				<Footer />
			</FooterContainer>
		</AppWrapper>
	);
}

export default App;
