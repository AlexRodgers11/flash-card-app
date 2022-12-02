import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import DeckList from "./DeckList";

function PracticeLaunchPage() {
    const decks = useSelector((state) => state.login.decks);
    const userId = useSelector((state) => state.login.userId);
    return (
        <div>
            <DeckList listType="user" listId={userId} />
        </div>
    );
}

export default PracticeLaunchPage;