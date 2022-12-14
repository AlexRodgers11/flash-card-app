import { Route, Routes } from 'react-router-dom';
import PracticeLaunchPage from './PracticeLaunchPage';
import BrowseDecks from './BrowseDecks';
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
import UserDecksPage from './UserDecksPage';
import UserGroupsPage from './UserGroupsPage';
import StatisticsPage from './StatisticsPage';
import DeckStatsList from './DeckStatsList';
import Sessions from './Sessions';
import DeckAttempt from './DeckAttempt';
import CardStatsList from './CardStatsList';
import CardAttemptList from './CardAttemptList';

function Router() {
    return (
        <Routes>
            <Route exact path="/groups/:groupId" element={<Group />} />
            <Route exact path="/decks/public" element={<BrowseDecks />}/>
            <Route exact path="/decks/:deckId" element={<Deck />} />
            <Route exact path="/users/:userId/decks/new" element={<DeckForm />} />
            <Route exact path="/users/:userId/decks" element={<UserDecksPage />} />
            <Route exact path="/users/:userId/groups" element={<UserGroupsPage />} />
            <Route exact path="/users/:userId/practice" element={<PracticeLaunchPage />} />
            <Route exact path="/users/:userId/statistics/" element={<StatisticsPage />}>
                <Route path="decks" element={<DeckStatsList />} />
                <Route path="cards" element={<CardStatsList />} />
                <Route path="sessions/decks/:deckId" element={<Sessions />} />
                <Route path="cards/:cardId" element={<CardAttemptList />} />
                <Route path="sessions/:sessionId" element={<DeckAttempt />} />
                <Route path="sessions" element={<Sessions allDecks={true}/>} />
            </Route>
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
