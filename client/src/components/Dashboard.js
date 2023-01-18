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
    &:hover {
        background-color: black;
        color: white !important;
    }    
    @media (max-width: 762px) {
        height: 30vw;
        width: 30vw;
    }
    @media (max-width: 625px) {
        height: 40vw;
        width: 40vw;
    }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }

//   @media (max-width: 430px) {
//     grid-template-columns: 1fr;
//     grid-template-rows: repeat(6, 1fr);
//   }
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

    return (
        <DashboardWrapper className="Dashboard">
            <Grid>
                <StyledLink to="/decks/public" >Browse All Decks</StyledLink>
                <StyledLink to={`/users/${user.userId}/decks`} >Your Decks</StyledLink>
                <StyledLink to={`/users/${user.userId}/decks/new`} >Create a New Deck</StyledLink>
                <StyledLink to={`/users/${user.userId}/groups`} >Your Groups</StyledLink>
                <StyledLink to={`/users/${user.userId}/practice`} >Practice</StyledLink>
                <StyledLink to={`/users/${user.userId}/statistics/sessions`} >Stats</StyledLink>
            </Grid>
        </DashboardWrapper>
    )
}

export default Dashboard