import { Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import Deck from './Deck';
import DeckForm from './DeckForm';
import Group from './Group';
import Login from './Login';
import PracticeSession from './PracticeSession';
import RegisterCredentialsForm from './RegisterCredentialsForm';
import RegisterIdentificationForm from './RegisterIdentificationForm';
import RegisterJoinGroupsForm from './RegisterJoinGroupsForm';
import User from './User';

function Router() {
                //next step test user route

    return (
        <Routes>
            <Route exact path="/groups/:groupId" element={<Group />} />
            <Route exact path="/decks/:deckId" element={<Deck />} />
            <Route exact path="/users/:userId/decks/new" element={<DeckForm />} />
            <Route exact path="/users/:userId" element={<User />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/users/:userId/decks/:deckId/practice-session" element={<PracticeSession />} />
            <Route exact path="/register/signup" element={<RegisterCredentialsForm />} />
            <Route exact path="/register/identification" element={<RegisterIdentificationForm />} />
            <Route exact path="/register/join-groups" element={<RegisterJoinGroupsForm />} />
            <Route exact path="/dashboard" element={<Dashboard />} />
        </Routes>
    )
}

export default Router;

//login/register
//dashboard
//add deck