import { Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import Deck from './Deck';
import DeckForm from './DeckForm';
import Group from './Group';
import LandingPage from './LandingPage';
import Login from './Login';
import Modal from './Modal';
import PracticeSession from './PracticeSession';
import RegisterCredentialsForm from './RegisterCredentialsForm';
import RegisterEmailVerificationForm from './RegisterEmailVerification';
import RegisterIdentificationForm from './RegisterIdentificationForm';
import RegisterJoinGroupsForm from './RegisterJoinGroupsForm';
import User from './User';

function Router() {
    return (
        <Routes>
            <Route exact path="/groups/:groupId" element={<Group />} />
            <Route exact path="/decks/:deckId" element={<Deck />} />
            <Route exact path="/users/:userId/decks/new" element={<DeckForm />} />
            <Route exact path="/users/:userId" element={<User />} />
            <Route exact path="/users/:userId/decks/:deckId/practice-session" element={<PracticeSession />} />
            <Route exact path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<LandingPage />}>
                <Route path="login" element={<Login />} />
                <Route path="register/credentials" element={<RegisterCredentialsForm />} />
                <Route path="register/email-verification" element={<RegisterEmailVerificationForm />} />
                <Route path="register/identification" element={<RegisterIdentificationForm />} />
                <Route path="register/join-groups" element={<RegisterJoinGroupsForm />} />
            </Route>
        </Routes>
    )
}

export default Router;
