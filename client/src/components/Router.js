import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PracticeLaunchPage from './PracticeLaunchPage';
import BrowseDecks from './BrowseDecks';
import Dashboard from './Dashboard';
import Deck from './Deck';
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
import DeckAttempt from './DeckAttempt';
import RegisterProfilePicCropForm from './RegisterProfilePicCropForm';
import { useSelector } from 'react-redux';
import UserSettings from './UserSettings';
import GroupMemberList from './GroupMemberList';
import GroupDecksSection from './GroupDecksSection';
import { GroupAdminSection } from './GroupAdminSection';
import CardStatsTable from './CardStatsTable';
import CardAttemptsTable from './CardAttemptsTable';
import DeckAttemptsTable from './DeckAttemptsTable';
import DeckStats from './DeckStats';
import { CookiePolicy } from './CookiePolicy';
import { PrivacyPolicy } from './PrivacyPolicy';
import PasswordReset from './PasswordReset';
import DeckPreview from './DeckPreview';

function Router() {
    const { pathname } = useLocation();
    const userId = useSelector((state) => state.login.userId);
    const accountSetupStage = useSelector((state) => state.login.accountSetupStage);

    const pathnamesThatDoNotNeedUserId = ["/", "/login", "/register/credentials", "/decks/public", "/cookie-policy", "/privacy-policy", "/reset-password", "register/profile-pic-crop"];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    
    if(userId) {
        if(accountSetupStage !== "complete") {
            switch(accountSetupStage) {
                case "email":
                    if(pathname !== "/register/email-verification") {
                        return <Navigate to="/register/email-verification" replace />;
                    }
                    break;
                case "verified":
                    if(pathname !== "/register/email-verification" && pathname !== "/register/identification") {
                        return <Navigate to="/register/identification" replace />;
                    }
                    break;
                default: 
                    break;
            }
        }
    } else {
        if(!pathnamesThatDoNotNeedUserId.includes(pathname)) {
            console.log("user unauthorized to view requested page");
            return <Navigate to="/" replace />
        }
    }

    return (
        <div className="Router" style={{minHeight: "calc(100vh - 5.5rem)"}}>
            <Routes>
                <Route exact path="/groups/:groupId" element={<Group />} >
                    <Route exact path="/groups/:groupId/admin-controls" element={<GroupAdminSection />} />
                    <Route exact path="/groups/:groupId/members" element={<GroupMemberList listType="members"/>} />
                    <Route exact path="/groups/:groupId/decks" element={<GroupDecksSection />} />
                </Route>
                <Route exact path="/groups/:groupId/decks/:deckId" element={<Deck />} />
                <Route exact path="/decks/public" element={<BrowseDecks />}/>
                <Route exact path="/decks/:deckId" element={<Deck />} />
                <Route path="/decks/:deckId/review" element={<DeckPreview />} />
                <Route exact path="/users/:userId/decks/:deckId" element={<Deck />} />
                <Route exact path="/users/:userId/decks" element={<UserDecksPage />} />
                <Route exact path="/users/:userId/groups" element={<UserGroupsPage />} />
                <Route exact path="/users/:userId/practice" element={<PracticeLaunchPage />} />
                <Route exact path="/users/:userId/settings" element={<UserSettings />} />
                <Route exact path="/users/:userId/statistics/" element={<StatisticsPage />}>
                    <Route exact path="decks" element={<DeckStats />} />
                    <Route exact path="cards" element={<CardStatsTable />} />
                    <Route exact path="sessions/decks/:deckId" element={<DeckAttemptsTable />} />
                    <Route exact path="cards/:cardId" element={<CardAttemptsTable />} />
                    <Route exact path="sessions/:sessionId" element={<DeckAttempt />} />
                    <Route exact path="sessions" element={<DeckAttemptsTable allDecks={true}/>} />
                </Route>
                <Route exact path="/users/:userId" element={<User />} />
                <Route exact path="/users/:userId/decks/:deckId/practice-session" element={<PracticeSession />} />
                <Route exact path="/dashboard" element={<Dashboard />} />
                {/* <Route path="/" element={<LandingPage />}> */}
                <Route path="/" element={<LandingPage />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register/credentials" element={<RegisterCredentialsForm />} />
                    <Route path="register/email-verification" element={<RegisterEmailVerificationForm />} />
                    <Route path="register/identification" element={<RegisterIdentificationForm />} />
                    <Route path="register/profile-pic-crop" element={<RegisterProfilePicCropForm />} />
                    <Route path="register/join-groups" element={<RegisterJoinGroupsForm />} />
                    <Route path="reset-password" element={<PasswordReset />} />
                </Route>
                <Route exact path="/cookie-policy" element={<CookiePolicy />} />
                <Route exact path="/privacy-policy" element={<PrivacyPolicy />} />
            </Routes>
        </div>
    )
}

export default Router;
