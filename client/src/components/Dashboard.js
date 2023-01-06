import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledLink = styled(Link)`
    margin: 5em;
    height: 20em;
    width: 20em; 
    border: 1px solid black; 
    display: flex; 
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

function Dashboard() {
    const user = useSelector((state) => state.login);

    const scrollToTop = () => {
        window.scrollTo(0, 0);
    }


    return (
        <div style={{display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center"}}>
            <StyledLink to="/decks/public" onClick={scrollToTop}>Browse All Decks</StyledLink>
            <StyledLink to={`/users/${user.userId}/decks`} onClick={scrollToTop}>Your Decks</StyledLink>
            <StyledLink to={`/users/${user.userId}/decks/new`} onClick={scrollToTop}>Create a New Deck</StyledLink>
            <StyledLink to={`/users/${user.userId}/groups`} onClick={scrollToTop}>Your Groups</StyledLink>
            <StyledLink to={`/users/${user.userId}/practice`} onClick={scrollToTop}>Practice</StyledLink>
            <StyledLink to={`/users/${user.userId}/statistics/sessions`} onClick={scrollToTop}>Stats</StyledLink>
        </div>
    )
}

export default Dashboard