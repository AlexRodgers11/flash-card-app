import React from "react";
import BrowseControlBar from "./BrowseControlBar";
import DeckList from "./DeckList";

function BrowseDecks() {
    return (
        <div>
            <BrowseControlBar />
            <DeckList listType="all" />
        </div>
    )
}

export default BrowseDecks;