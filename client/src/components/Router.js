import { Route, Routes } from 'react-router-dom';
import Deck from './Deck';
import Group from './Group';

function Router() {
    return (
        <Routes>
            <Route exact path="/groups/:groupId" element={<Group />} />
            <Route exact path="/decks/:deckId" element={<Deck />} />
        </Routes>
    )
}

export default Router;