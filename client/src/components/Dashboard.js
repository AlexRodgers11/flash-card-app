import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { GiBookCover, GiStack } from "react-icons/gi";
import { HiUserGroup } from "react-icons/hi";
import { HiRectangleStack } from "react-icons/hi2";
import { SiBookstack } from "react-icons/si";
import { GoGraph } from "react-icons/go";
import { ImSearch } from "react-icons/im";
import { RiUserSettingsFill } from "react-icons/ri";

const DashboardWrapper = styled.div`
    display: flex;
    min-height: calc(100vh - 5.5rem);
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    background-color: #FFD549;
`

const StyledLink = styled(Link)`
    display: flex; 
    margin: 4vw;
    padding: .25rem;
    height: 24vw;
    width: 24vw;
    max-height: 280px;
    max-width: 280px;
    min-height: 150px;
    min-width: 150px;
    border: 3px solid black; 
    border-radius: 5%;
    align-items: center; 
    justify-content: center; 
    text-decoration: none; 
    color: black; 
    background-color: white;
    box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
    & .hover-text {
        display: none;
        font-size: 1.75rem;
    }
    &:hover {
        background-color: black;
        border-color: white;
        color: white !important;
        transform: translateY(-4px);
        box-shadow: 0px 10px 20px #000000; /
    }    
    &:hover .icon {
        display: none;
    }
    &:hover .hover-text {
        display: block;
    }
    @media (max-width: 762px) {
        height: 30vw;
        width: 30vw;
    }
    @media (max-width: 625px) {
        height: 40vw;
        width: 40vw;
    }
    // background-color: #00bfff;
//   box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.1);
  border-radius: 5%;
  box-shadow: 0px 0px 3px #000000; /* adjust the shadow size and color as needed */

  transition: all 0.3s ease-in-out;
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


function Dashboard() {
    const user = useSelector((state) => state.login);

    return (
        <DashboardWrapper className="Dashboard">
            <Grid className="Grid">
                <StyledLink to="/decks/public" ><ImSearch className="icon" size="7rem" /><p className="hover-text">Search Public Decks</p></StyledLink>
                <StyledLink to={`/users/${user.userId}/decks`} ><HiRectangleStack className="icon" size="7rem" /><p className="hover-text">Your Decks</p></StyledLink>
                <StyledLink to={`/users/${user.userId}/settings`} ><RiUserSettingsFill className="icon" size = "7rem" /><p className="hover-text">Profile Settings</p></StyledLink>
                <StyledLink to={`/users/${user.userId}/groups`} ><HiUserGroup className="icon" size="7rem"/><p className="hover-text">Your Groups</p></StyledLink>
                {/* <StyledLink to={`/users/${user.userId}/groups`} ><HiUserGroup className="icon" size="7rem" color="blue"/><p className="hover-text">Your Groups</p></StyledLink> */}
                <StyledLink to={`/users/${user.userId}/practice`} ><GiBookCover className="icon" size="7rem" /><p className="hover-text">Practice</p></StyledLink>
                <StyledLink to={`/users/${user.userId}/statistics/sessions`} ><GoGraph className="icon" size="7rem" /><p className="hover-text">Statistics</p></StyledLink>
            </Grid>
        </DashboardWrapper>
    )
}

export default Dashboard