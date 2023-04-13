import Header from './components/Header';
import Router from './components/Router';
import styled from 'styled-components';
import Footer from './components/Footer';
import { disableReactDevTools } from "@fvilers/disable-react-devtools";

if(process.env.NODE_ENV === "production") {
	disableReactDevTools();
}

const AppWrapper = styled.div`
	text-align: center;
	position: relative;
	height: 100%;
	width: 100%;
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
