import { Outlet, useParams } from "react-router";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const StatisticsWrapper = styled.div`
    // background-color: #503047;
    background-color: #CC52CC;
    min-height: calc(100vh - 5.5rem);
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
    color: white !important;
`;

function StatisticsPage() {
    const { userId } = useParams();
    
    return (
        <StatisticsWrapper>
            <StatsNavbar>
                <StyledNavLink to={`/users/${userId}/statistics/sessions`}>Sessions</StyledNavLink>
                <StyledNavLink to={`/users/${userId}/statistics/decks`}>Deck Statistics</StyledNavLink> 
                <StyledNavLink to={`/users/${userId}/statistics/cards`}>Card Statistics</StyledNavLink> 
            </StatsNavbar>
            <Outlet />
        </StatisticsWrapper>
    );
}

export default StatisticsPage;