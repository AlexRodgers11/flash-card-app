import Header from './components/Header';
import Router from './components/Router';
import styled from 'styled-components';

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
		margin-block-start: 0;
		margin-block-end: 0;
		margin-inline-start: 0;
		margin-inline-end: 0;
	}
	& *::marker {
		content: none;
	}
`

const HeaderContainer = styled.div`
	height: 4.5rem
`

const MainContainer = styled.div`
	min-height: calc(100vh - 4.5rem); 
`

const FooterContainer = styled.div`
	height: 15vh; 
	minHeight: 15rem
`

function App() {
	return (
		<AppWrapper>
			<HeaderContainer>
				<Header />
			</HeaderContainer>
			<MainContainer>
				<Router />
			</MainContainer>
			<FooterContainer>
				Footer will go here
			</FooterContainer>
		</AppWrapper>
	);
}

export default App;
