import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PracticeLaunchPage from './PracticeLaunchPage';
import BrowseDecks from './BrowseDecks';
import Dashboard from './Dashboard';
import Deck from './Deck';
import DeckForm from './DeckForm';
import Group from './Group';
import LandingPage from './LandingPage';
import Login from './Login';
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
import RegisterProfilePicCropForm from './RegisterProfilePicCropForm';
import { useSelector } from 'react-redux';
import UserSettings from './UserSettings';
import GroupMemberList from './GroupMemberList';
import GroupMemberListNew from './GroupMemberListNew';
import DeckList from './DeckList';
import GroupDecksSection from './GroupDecksSection';
import { GroupAdminSection } from './GroupAdminSection';

function Router() {
    const { pathname } = useLocation();
    const userId = useSelector((state) => state.login.userId);
    const accountSetupStage = useSelector((state) => state.login.accountSetupStage);

    const pathnamesThatDoNotNeedUserId = ["/", "/login", "/register/credentials", "/decks/public"];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    
    if(userId) {
        // console.log("userId found");
        if(accountSetupStage !== "complete") {
            // console.log("registration incomplete");
            // console.log(`still on stage ${accountSetupStage}`);
            switch(accountSetupStage) {
                case "email":
                    // console.log("in email case");
                    if(pathname !== "/register/email-verification") {
                        return <Navigate to="/register/email-verification" replace />;
                    }
                    break;
                case "verified":
                    // console.log("in verified case");
                    if(pathname !== "/register/email-verification" && pathname !== "/register/identification") {
                        return <Navigate to="/register/identification" replace />;
                    }
                    break;
                default: 
                    // console.log("in default case");
                    break;
            }
        }
    } else {
        // console.log("no userId found")
        if(!pathnamesThatDoNotNeedUserId.includes(pathname)) {
            console.log("user unauthorized to view requested page");
            return <Navigate to="/" replace />
        }
    }

    // console.log("made it past conditional tree");
    return (
        <div className="Router" style={{minHeight: "calc(100vh - 5.5rem)"}}>
            <Routes>
                <Route exact path="/groups/:groupId" element={<Group />} >
                    <Route exact path="/groups/:groupId/admin-controls" element={<GroupAdminSection />} />
                    <Route exact path="/groups/:groupId/members" element={<GroupMemberListNew listType="members"/>} />
                    <Route exact path="/groups/:groupId/decks" element={<GroupDecksSection />} />
                </Route>
                <Route exact path="/groups/:groupId/decks/:deckId" element={<Deck />} />
                <Route exact path="/decks/public" element={<BrowseDecks />}/>
                <Route exact path="/decks/:deckId" element={<Deck />} />
                <Route exact path="/users/:userId/decks/new" element={<DeckForm />} />
                <Route exact path="/users/:userId/decks" element={<UserDecksPage />} />
                <Route exact path="/users/:userId/groups" element={<UserGroupsPage />} />
                <Route exact path="/users/:userId/practice" element={<PracticeLaunchPage />} />
                <Route exact path="/users/:userId/settings" element={<UserSettings />} />
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
                    <Route path="register/profile-pic-crop" element={<RegisterProfilePicCropForm />} />
                    <Route path="register/join-groups" element={<RegisterJoinGroupsForm />} />
                </Route>
            </Routes>
        </div>
    )
}

export default Router;
