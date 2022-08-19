import { Route, Routes } from 'react-router-dom';
import Deck from './Deck';
import Group from './Group';
import User from './User';

function Router() {
                //next step test user route

    return (
        <Routes>
            <Route exact path="/groups/:groupId" element={<Group />} />
            <Route exact path="/decks/:deckId" element={<Deck />} />
            <Route exact path="/users/:userId" element={<User />} />
        </Routes>
    )
}

export default Router;