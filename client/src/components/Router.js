import { Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import Deck from './Deck';
import Group from './Group';
import Login from './Login';
import Register from './Register';
import User from './User';

function Router() {
                //next step test user route

    return (
        <Routes>
            <Route exact path="/groups/:groupId" element={<Group />} />
            <Route exact path="/decks/:deckId" element={<Deck />} />
            <Route exact path="/users/:userId" element={<User />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/register" element={<Register />} />
            <Route exact path="/dashboard" element={<Dashboard />} />
        </Routes>
    )
}

export default Router;