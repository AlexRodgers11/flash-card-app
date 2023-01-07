import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledLink = styled(Link)`
    display: flex; 
    margin: 5vw;
    height: 24vw;
    width: 24vw;
    max-height: 280px;
    max-width: 280px;
    min-height: 150px;
    min-width: 150px;
    border: 1px solid black; 
    align-items: center; 
    justify-content: center; 
    text-decoration: none; 
    color: black; 
    cursor: pointer;
    &:hover {
        background-color: black;
        color: white !important;
    }    
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }

  @media (max-width: 430px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, 1fr);
  }
`;

const DashboardWrapper = styled.div`
    display: flex;
    min-height: calc(100vh - 4.5rem);
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
`

function Dashboard() {
    const user = useSelector((state) => state.login);

    const scrollToTop = () => {
        window.scrollTo(0, 0);
    }


    return (
        <DashboardWrapper className="Dashboard">
            <Grid>
                <StyledLink to="/decks/public" onClick={scrollToTop}>Browse All Decks</StyledLink>
                <StyledLink to={`/users/${user.userId}/decks`} onClick={scrollToTop}>Your Decks</StyledLink>
                <StyledLink to={`/users/${user.userId}/decks/new`} onClick={scrollToTop}>Create a New Deck</StyledLink>
                <StyledLink to={`/users/${user.userId}/groups`} onClick={scrollToTop}>Your Groups</StyledLink>
                <StyledLink to={`/users/${user.userId}/practice`} onClick={scrollToTop}>Practice</StyledLink>
                <StyledLink to={`/users/${user.userId}/statistics/sessions`} onClick={scrollToTop}>Stats</StyledLink>
            </Grid>
        </DashboardWrapper>
    )
}

export default Dashboard