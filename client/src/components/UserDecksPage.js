import { useParams } from "react-router";
import { Link } from "react-router-dom";
import DeckList from "./DeckList";

function UserDecksPage() {
    const { userId } = useParams(); 
    return (
        <div>
            {/* <Link to={`/users/${userId}/decks/new`} style={{textDecoration: "none", color:"inherit", margin: "5em", border: "1px solid black", cursor: "pointer"}}><div>Create a New Deck</div></Link> */}
            <Link to={`/users/${userId}/decks/new`}  style={{display: "inline-block", textDecoration: "none", color:"inherit", margin: "5em", padding: ".5em 1em", border: "1px solid black", cursor: "pointer"}}><div>Create New Deck</div></Link>
            <DeckList listType="user" listId={userId} />
        </div>
    );
}

export default UserDecksPage;