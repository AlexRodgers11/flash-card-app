import { Outlet, useParams } from "react-router";
import { NavLink } from "react-router-dom";

function StatisticsPage() {
    const { userId } = useParams();
    
    return (
        <div>
            <NavLink to={`/users/${userId}/statistics/sessions`}>Sessions</NavLink>
            <NavLink to={`/users/${userId}/statistics/decks`}>Deck Statistics</NavLink> 
            <NavLink to={`/users/${userId}/statistics/cards`}>Card Statistics</NavLink> 
            <Outlet />
        </div>
    );
}

export default StatisticsPage;