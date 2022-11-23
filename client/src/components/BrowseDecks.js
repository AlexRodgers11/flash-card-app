import React from "react";
import DeckList from "./DeckList";

function BrowseDecks() {
    return (
        <div>
            <div>This will be a search/filter bar</div>
            <DeckList listType="all" />
        </div>
    )
}

export default BrowseDecks;