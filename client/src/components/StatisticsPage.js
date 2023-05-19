import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const StatisticsWrapper = styled.div`
    background-color: #503047;
    background-color: #CC52CC;
    background-color: #FFD549;
    background-color: #52B2FF;
    background-color: #9DE59D;
    min-height: calc(100vh - 5.5rem);
    *::-webkit-scrollbar {
        display: none;
    }
`;

const StatsNavbar = styled.div`
    position: fixed;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
    height: 3rem;
    background-color: #393939;
    color: white;
    font-size: 1.25rem;
    @media (max-width: 960px) {
        font-size: 1rem;       
    @media (max-width: 790px) {
        font-size: .85rem;
    }
    @media (max-width: 690px) {
        font-size: .75rem;
    }
    @media (max-width: 625px) {
        font-size: .65rem;
    }
    @media (max-width: 515px) {
        font-size: .85rem;
        height: 5rem;
        flex-direction: column;
        justify-content: center;
    }
`;

const StyledNavLink = styled(NavLink)`
    display: inline-flex;
    align-items: center;
    padding: 0 1rem;
    color: white;
    height: 100%;
    &:hover {
        color: #d1d1d1 !important;
        background-color: #1a1a1a;
    }
    &.active {
        color: white !important;
        background-color: black;
    }
`;

function StatisticsPage() {
    const userId = useSelector((state) => state.login.userId);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if((!location.pathname.slice(42).includes("decks") && !location.pathname.slice(42).includes("cards")) && !location.pathname.slice(42).includes("sessions")) {
            console.log(location.pathname.slice(42));
            navigate(`/users/${userId}/statistics/sessions`);
        }
    }, [location.pathname, userId, navigate]);
    
    return (
        <StatisticsWrapper>
            <StatsNavbar>
                <StyledNavLink className={({isActive}) => isActive ? "active" : ""} to={`/users/${userId}/statistics/sessions`}>Sessions</StyledNavLink>
                <StyledNavLink className={({isActive}) => isActive ? "active" : ""} to={`/users/${userId}/statistics/decks`}>Deck Statistics</StyledNavLink> 
                <StyledNavLink className={({isActive}) => isActive ? "active" : ""} to={`/users/${userId}/statistics/cards`}>Card Statistics</StyledNavLink> 
            </StatsNavbar>
            <Outlet />
        </StatisticsWrapper>
    );
}

export default StatisticsPage;