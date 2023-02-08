import { Outlet, useParams } from "react-router";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const StatisticsWrapper = styled.div`
    // background-color: #503047;
    background-color: #CC52CC;
    min-height: calc(100vh - 5.5rem);
`;

function StatisticsPage() {
    const { userId } = useParams();
    
    return (
        <StatisticsWrapper>
            <NavLink to={`/users/${userId}/statistics/sessions`}>Sessions</NavLink>
            <NavLink to={`/users/${userId}/statistics/decks`}>Deck Statistics</NavLink> 
            <NavLink to={`/users/${userId}/statistics/cards`}>Card Statistics</NavLink> 
            <Outlet />
        </StatisticsWrapper>
    );
}

export default StatisticsPage;