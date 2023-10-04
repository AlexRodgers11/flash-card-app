import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { BsFillCameraFill } from "react-icons/bs";
import { HiOutlineUserCircle } from "react-icons/hi";
import { MdModeEditOutline } from "react-icons/md";
import { deleteProfile, resetAllStatistics, updateDirectMessagePreference, updateEmailPreferences, updateNotificationSettings, updatePrivacySettings, updateProfilePic, updateUser } from "../reducers/loginSlice";
import useFormInput from "../hooks/useFormInput";
import Modal from "./Modal";
import RegisterProfilePicCropForm from "./RegisterProfilePicCropForm"; //probably rename all of these to exclude the word "Register"
import axios from "axios";
import { resetStats } from "../reducers/attemptsSlice";

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const UserSettingsWrapper = styled.div`
    display: flex;
    min-height: calc(100vh - 5.5rem);
    align-items: center;
    justify-content: center;
    background-color: #FFD549;
    @media (max-width: 400px) {
        font-size: .75rem
    }
`;

const SettingsForm = styled.form`
    width: 70%;
    max-width: 850px;
    min-width: 350px;
    background-color: #FFD549;
    padding: 3rem 0;
`;

const SettingsSection = styled.section`
    display: flex;    
    border: 2px solid black;
    margin-bottom: 1.5rem;
    background-color: white;
`;

const SettingsCategoryLabel = styled.p`
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0 25%;
    padding: 1rem;
    border-right: 1px solid black;
    background-color: #e3e3e3;
    font-weight: 600;
`;

const SettingsCategoryOptions = styled.div`
    flex-grow: 1;
    text-align: center;
    padding: 1rem;
`;

const SettingCategoryOption = styled.div.attrs({
    className: "SettingCategoryOption"
})`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    & div span:first-of-type {
        font-weight: 600;
    }
    & > div:last-child {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
    }
    & button {
        margin: 0 .15rem;
        @media (max-width: 750px) {
            padding: .25rem;
            font-size: .85rem;
        }
    }
`;
    
const ProfilePicContainer = styled.div`
    position: relative;
    display: inline-flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 2rem;
`;

const ProfilePic = styled.img`
    border: 1px solid transparent; 
    border-radius: 50%;
    height: 20rem;
    width: 20rem;
    @media (max-width: 915px) {
        height: 15rem;
        width: 15rem;
        margin-right: 1rem;
    }
    @media (max-width: 795px) {
        height: 10rem;
        width: 10rem;
    }
    @media (max-width: 680px) {
        margin-right: 0;
        margin-bottom: 1rem;
    }  
`;

const StyledEditIcon = styled(MdModeEditOutline)`
    cursor: pointer;
`;

const StyledPhotoEditIcon = styled(BsFillCameraFill)`
    cursor: pointer;
    // background-color: white;
    // background-color: blue;
    border-radius: 10%;
    // padding: .15rem;
    position: absolute;
    width: 2rem;
    height: 2rem;
    right: ${props => props.avatar ? "2rem" : 0};
    bottom: ${props => props.avatar ? "1.25rem" : 0};
`;

const ErrorAlert = styled.div`
    margin-top: .25rem;
    border-radius: .25rem;
    background-color: #f55656;
    color: white;
`;

const StyledButton = styled.button`
    // background-color: white;
    padding: .50rem;
    border: 2px solid black;
    &:hover {
        border: 2px solid white;
    }
`;

const ToggleSwitch = styled.div`
    display: inline-block;
`

const ProfilePicEditContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    & button {
        padding: .5rem;
        margin: 0 .25rem;
    }
`;

const BlockImg = styled.img`
    display: block;
    margin-bottom: .75rem;
    max-width: 75%;
`;

const StyledHiOutlineUserCircle = styled(HiOutlineUserCircle)`
    color: black;
    height: 20rem;
    width: 20rem;
    margin-right: 2rem;
    @media (max-width: 915px) {
        height: 15rem;
        width: 15rem;
        margin-right: 1rem;
    }
    @media (max-width: 795px) {
        height: 10rem;
        width: 10rem;
    }
    @media (max-width: 680px) {
        margin-right: 0;
        margin-bottom: 1rem;
    }    
`;

const ButtonWrapper = styled.div`
	display: flex;
	justify-content: center;
	padding-top: 2.5rem;
	& button {
		margin: 0 .75rem;
		@media (max-width: 330px) {
			margin: 0 .375rem;
		}
	}
	@media (max-width: 330px) {
		padding-top: 2rem;
	}
`;

function UserSettings() {
    const userId = useSelector((state) => state.login.userId);
    const [modalContent, setModalContent] = useState("");
    const [editField, setEditField] = useState("");
    const username = useSelector((state) => state.login.login.username);
    const firstName = useSelector((state) => state.login.name.first);
    const lastName = useSelector((state) => state.login.name.last);
    const displayPronouns = useSelector((state) => state.login.name.displayPronouns);
    const pronouns = useSelector((state) => state.login.name.pronouns);
    const email = useSelector((state) => state.login.login.email);
    const profilePic = useSelector((state) => state.login.photo);
    const emailPrivacy = useSelector((state) => state.login.privacy.email);
    const namePrivacy = useSelector((state) => state.login.privacy.name);
    const groupsPrivacy = useSelector((state) => state.login.privacy.groups);
    const profilePhotoPrivacy = useSelector((state) => state.login.privacy.profilePhoto);
    const newDecksPrivacy = useSelector((state) => state.login.privacy.newDecks);
    const currentDecksPrivacy = useSelector((state) => state.login.privacy.currentDecks);
    
    const adminChangeNotification = useSelector((state) => state.login.communicationSettings.notificationPreferences.adminChange);
    const deckAddedNotification = useSelector((state) => state.login.communicationSettings.notificationPreferences.deckAdded);
    const groupDeletedNotification = useSelector((state) => state.login.communicationSettings.notificationPreferences.groupDeleted);
    const headAdminChangeNotification = useSelector((state) => state.login.communicationSettings.notificationPreferences.headAdminChange);
    const newMemberJoinedNotification = useSelector((state) => state.login.communicationSettings.notificationPreferences.newMemberJoined);
    const removedFromGroupNotification = useSelector((state) => state.login.communicationSettings.notificationPreferences.removedFromGroup)

    const cardDecisionMessage = useSelector((state) => state.login.communicationSettings.emailPreferences.cardDecision);
    const cardSubmissionMessage = useSelector((state) => state.login.communicationSettings.emailPreferences.cardSubmission);
    const deckDecisionMessage = useSelector((state) => state.login.communicationSettings.emailPreferences.deckDecision);
    const deckSubmissionMessage = useSelector((state) => state.login.communicationSettings.emailPreferences.deckSubmission);
    const directMessage = useSelector((state) => state.login.communicationSettings.emailPreferences.direct);
    const groupInvitationMessage = useSelector((state) => state.login.communicationSettings.emailPreferences.groupInvitation);
    const invitationDecisionMessage = useSelector((state) => state.login.communicationSettings.emailPreferences.invitationDecision);
    const joinDecisionMessage = useSelector((state) => state.login.communicationSettings.emailPreferences.joinDecision);
    const joinRequestMessage = useSelector((state) => state.login.communicationSettings.emailPreferences.joinRequest);
    
    const allowDirectMessages = useSelector((state) => state.login.communicationSettings.allowDirectMessages);
    
    const inactivityLengthBeforeLogout = useSelector((state) => state.login.inactivityLengthBeforeLogout);

    const [errorField, setErrorField] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    const [emailInputValue, clearEmailInputValue, handleEmailInputValueChange, setEmailInputValue] = useFormInput(email);
    const [usernameInputValue, clearUsernameInputValue, handleUsernameInputValueChange, setUsernameInputValue] = useFormInput(username);
    const [firstNameInputValue, clearFirstNameInputValue, handleFirstNameInputValueChange, setFirstNameInputValue] = useFormInput(firstName);
    const [lastNameInputValue, clearLastNameInputValue, handleLastNameInputValueChange, setLastNameInputValue] = useFormInput(lastName);
    const [displayPronounsInputValue, clearDisplayPronounsInputValue, handleDisplayPronounsInputValueChange, setDisplayPronounsInputValue] = useFormInput(displayPronouns, "checkbox");
    const [pronounsInputValue, clearPronounsInputValue, handlePronounsInputValueChange, setPronounsInputValue] = useFormInput(pronouns);
    const [passwordInputValue, clearPasswordInputValue, handlePasswordInputValueChange, setPasswordInputValue] = useFormInput("");
    const [passwordConfirmInputValue, clearPasswordConfirmInputValue, handlePasswordConfirmInputValueChange, setPasswordConfirmInputValue] = useFormInput("");
    const [photoInputValue, setPhotoInputValue] = useState();
    
    const statisticsTracking = useSelector((state) => state.login.statisticsTracking);
    
    const [statisticsTrackingSelectedValue, clearStatisticsTrackingSelectedValue, handleStatisticsTrackingSelectedValueChange, 
    setStatisticsTrackingSelectedValue] = useFormInput(statisticsTracking);
    const [emailPrivacySelectedValue, clearEmailPrivacySelectedValue, handleEmailPrivacySelectedValueChange, setEmailPrivacySelectedValue] = useFormInput(emailPrivacy);
    const [namePrivacySelectedValue, clearNamePrivacySelectedValue, handleNamePrivacySelectedValueChange, setNamePrivacySelectedValue] = useFormInput(namePrivacy);
    const [groupsPrivacySelectedValue, clearGroupsPrivacySelectedValue, handleGroupsPrivacySelectedValueChange, setGroupsPrivacySelectedValue] = useFormInput(groupsPrivacy);
    const [profilePhotoPrivacySelectedValue, clearProfilePhotoPrivacySelectedValue, handleProfilePhotoPrivacySelectedValueChange, setProfilePhotoPrivacySelectedValue] = useFormInput(profilePhotoPrivacy);
    const [newDecksPrivacySelectedValue, clearNewDecksPrivacySelectedValue, handleNewDecksPrivacySelectedValueChange, setNewDecksPrivacySelectedValue] = useFormInput(newDecksPrivacy);
    const [currentDecksPrivacySelectedValue, clearCurrentDecksPrivacySelectedValue, handleCurrentDecksPrivacySelectedValueChange, setCurrentDecksPrivacySelectedValue] = useFormInput(currentDecksPrivacy);

    const [adminChangeNotificationSelectedValue, clearAdminChangeNotificationSelectedValue, handleAdminChangeNotificationSelectedValueChange, setAdminChangeNotificationSelectedValue] = useFormInput(adminChangeNotification, "checkbox");

    const [deckAddedNotificationSelectedValue, clearDeckAddedNotificationSelectedValue, handleDeckAddedNotificationSelectedValueChange, setDeckAddedNotificationSelectedValue] = useFormInput(deckAddedNotification, "checkbox");

    const [groupDeletedNotificationSelectedValue, clearGroupDeletedNotificationSelectedValue, handleGroupDeletedNotificationSelectedValueChange, setGroupDeletedNotificationSelectedValue] = useFormInput(groupDeletedNotification, "checkbox");

    const [headAdminChangeNotificationSelectedValue, clearHeadAdminChangeNotificationSelectedValue, handleHeadAdminChangeNotificationSelectedValueChange, setHeadAdminChangeNotificationSelectedValue] = useFormInput(headAdminChangeNotification, "checkbox");
    
    const [newMemberJoinedNotificationSelectedValue, clearNewMemberJoinedNotificationSelectedValue, handleNewMemberJoinedNotificationSelectedValueChange, setNewMemberJoinedNotificationSelectedValue] = useFormInput(newMemberJoinedNotification, "checkbox");
    
    const [removedFromGroupNotificationSelectedValue, clearRemovedFromGroupNotificationSelectedValue, handleRemovedFromGroupNotificationSelectedValueChange, setRemovedFromGroupNotificationSelectedValue] = useFormInput(removedFromGroupNotification, "checkbox");

    const [cardDecisionMessageSelectedValue, clearCardDecisionMessageSelectedValue, handleCardDecisionMessageSelectedValueChange, setCardDecisionMessageSelectedValue] = useFormInput(cardDecisionMessage, "checkbox");

    const [cardSubmissionMessageSelectedValue, clearCardSubmissionSelectedValue, handleCardSubmissionMessageSelectedValueChange, setCardSubmissionMessageSelectedValue] = useFormInput(cardSubmissionMessage, "checkbox");

    const [deckDecisionMessageSelectedValue, clearDeckDecisionMessageSelectedValue, handleDeckDecisionMessageSelectedValueChange, setDeckDecisionMessageSelectedValue] = useFormInput(deckDecisionMessage, "checkbox");

    const [deckSubmissionMessageSelectedValue, clearDeckSubmissionMessageSelectedValue, handleDeckSubmissionMessageSelectedValueChange, setDeckSubmissionMessageSelectedValue] = useFormInput(deckSubmissionMessage, "checkbox");

    const [directMessageSelectedValue, clearDirectMessageSelectedValue, handleDirectMessageSelectedValueChange, setDirectMessageSelectedValue] = useFormInput(directMessage, "checkbox");
    
    const [groupInvitationMessageSelectedValue, clearGroupInvitationMessageSelectedValue, handleGroupInvitationMessageSelectedValueChange, setGroupInvitationMessageSelectedValue] = useFormInput(groupInvitationMessage, "checkbox");
    
    const [invitationDecisionMessageSelectedValue, clearInvitationDecisionMessageSelectedValue, handleInvitationDecisionMessageSelectedValueChange, setInvitationDecisionMessageSelectedValue] = useFormInput(invitationDecisionMessage, "checkbox");

    const [joinDecisionMessageSelectedValue, clearJoinDecisionMessageSelectedValue, handleJoinDecisionMessageSelectedValueChange, setJoinDecisionMessageSelectedValue] = useFormInput(joinDecisionMessage, "checkbox");

    const [joinRequestMessageSelectedValue, clearJoinRequestMessageSelectedValue, handleJoinRequestMessageSelectedValueChange, setJoinRequestMessageSelectedValue] = useFormInput(joinRequestMessage, "checkbox");

    const [allowDirectMessagesSelectedValue, clearAllowDirectMessagesSelectedValue, handleAllowDirectMessagesSelectedValueChange, setAllowDirectMessagesSelectedValue] = useFormInput(allowDirectMessages, "checkbox");

    const [inactivityLengthBeforeLogoutSelectedValue, clearInactivityLengthBeforeLogoutSelectedValue, handleInactivityLengthBeforeLogoutSelectedValueChange, setInactivityLengthBeforeLogoutSelectedValue] = useFormInput(inactivityLengthBeforeLogout);

    const dispatch = useDispatch();

    const dispatchActionThenClearEditField = (action)  => {
        dispatch(action)
            .then(() => {
                setEditField("");
            });
    }

    const hideModal = () => {
        setModalContent("");
    }

    const resetSettingSelectedValueToCurrentStateValue = (currentValue, settingSelectedValue, func) => {
        if(currentValue !== settingSelectedValue) {
            func(currentValue);
        }
    }

    const handleEditSelection = evt => {
        if(errorMessage) {
            setErrorMessage("");
            setErrorField("");
        }
        switch(evt.currentTarget.dataset.editfield) {
            case "email":
                resetSettingSelectedValueToCurrentStateValue(email, emailInputValue, setEmailInputValue);
                break;
            case "username":
                resetSettingSelectedValueToCurrentStateValue(username, usernameInputValue, setUsernameInputValue);
                break;
            case "first-name": 
                resetSettingSelectedValueToCurrentStateValue(firstName, firstNameInputValue, setFirstNameInputValue);
                break;
            case "last-name": 
                resetSettingSelectedValueToCurrentStateValue(lastName, lastNameInputValue, setLastNameInputValue);
                break
            case "display-pronouns":
                resetSettingSelectedValueToCurrentStateValue(displayPronouns, displayPronounsInputValue, setDisplayPronounsInputValue);
                break;
            case "pronouns":
                resetSettingSelectedValueToCurrentStateValue(pronouns, pronounsInputValue, setPronounsInputValue);
                break;
            case "password":
                setPasswordInputValue("");
                setPasswordConfirmInputValue("");
                break;
            case "stats-track":
                resetSettingSelectedValueToCurrentStateValue(statisticsTracking, statisticsTrackingSelectedValue, setStatisticsTrackingSelectedValue);
                break;
            case "email-privacy":
                resetSettingSelectedValueToCurrentStateValue(emailPrivacy, emailPrivacySelectedValue, setEmailPrivacySelectedValue);
                break;
            case "name-privacy":
                resetSettingSelectedValueToCurrentStateValue(namePrivacy, namePrivacySelectedValue, setNamePrivacySelectedValue);
                break;
            case "profile-photo-privacy":
                resetSettingSelectedValueToCurrentStateValue(profilePhotoPrivacy, profilePhotoPrivacySelectedValue, setProfilePhotoPrivacySelectedValue);
                break;
            case "groups-privacy":
                resetSettingSelectedValueToCurrentStateValue(groupsPrivacy, groupsPrivacySelectedValue, setGroupsPrivacySelectedValue);
                break;
            case "new-decks-privacy":
                resetSettingSelectedValueToCurrentStateValue(newDecksPrivacy, newDecksPrivacySelectedValue, setNewDecksPrivacySelectedValue);
                break;
            case "current-decks-privacy":
                resetSettingSelectedValueToCurrentStateValue(currentDecksPrivacy, currentDecksPrivacySelectedValue, setCurrentDecksPrivacySelectedValue);
                break;
            case "admin-change-notification": 
                resetSettingSelectedValueToCurrentStateValue(adminChangeNotification, adminChangeNotificationSelectedValue, setAdminChangeNotificationSelectedValue);
                break;
            case "deck-added-notification":
                resetSettingSelectedValueToCurrentStateValue(deckAddedNotification, deckAddedNotificationSelectedValue, setDeckAddedNotificationSelectedValue);
                break;
            case "group-deleted-notification":
                resetSettingSelectedValueToCurrentStateValue(groupDeletedNotification, groupDeletedNotificationSelectedValue, setGroupDeletedNotificationSelectedValue);
                break;
            case "head-admin-change-notification": 
                resetSettingSelectedValueToCurrentStateValue(headAdminChangeNotification, headAdminChangeNotificationSelectedValue, setHeadAdminChangeNotificationSelectedValue);
                break;
            case "new-member-joined-notification":
                resetSettingSelectedValueToCurrentStateValue(newMemberJoinedNotification, newMemberJoinedNotificationSelectedValue, setNewMemberJoinedNotificationSelectedValue);
                break;
            case "removed-from-group-notification":
                resetSettingSelectedValueToCurrentStateValue(removedFromGroupNotification, removedFromGroupNotificationSelectedValue, setRemovedFromGroupNotificationSelectedValue);
                break;
            case "card-decision-message":
                resetSettingSelectedValueToCurrentStateValue(cardDecisionMessage, cardDecisionMessageSelectedValue, setCardDecisionMessageSelectedValue);
                break;
            case "card-submission-message":
                resetSettingSelectedValueToCurrentStateValue(cardSubmissionMessage, cardSubmissionMessageSelectedValue, setCardSubmissionMessageSelectedValue);
                break;
            case "deck-decision-message":
                resetSettingSelectedValueToCurrentStateValue(deckDecisionMessage, deckDecisionMessageSelectedValue, setDeckDecisionMessageSelectedValue);
                break;
            case "deck-submission-message":
                resetSettingSelectedValueToCurrentStateValue(deckSubmissionMessage, deckSubmissionMessageSelectedValue, setDeckSubmissionMessageSelectedValue);
                break;
            case "direct-message":
                resetSettingSelectedValueToCurrentStateValue(directMessage, directMessageSelectedValue, setDirectMessageSelectedValue);
                break;
            case "group-invitation-message":
                resetSettingSelectedValueToCurrentStateValue(groupInvitationMessage, groupInvitationMessageSelectedValue, setGroupInvitationMessageSelectedValue);
                break;
            case "invitation-decision-message":
                resetSettingSelectedValueToCurrentStateValue(invitationDecisionMessage, invitationDecisionMessageSelectedValue, setInvitationDecisionMessageSelectedValue);
                break;
            case "join-decision-message":
                resetSettingSelectedValueToCurrentStateValue(joinDecisionMessage, joinDecisionMessageSelectedValue, setJoinDecisionMessageSelectedValue);
                break;
            case "join-request-message":
                resetSettingSelectedValueToCurrentStateValue(joinRequestMessage, joinRequestMessageSelectedValue, setJoinRequestMessageSelectedValue);
                break;
            case "allow-direct-messages":
                resetSettingSelectedValueToCurrentStateValue(allowDirectMessages, allowDirectMessagesSelectedValue, setAllowDirectMessagesSelectedValue);
                break;
            case "inactivity-length-before-logout":
                resetSettingSelectedValueToCurrentStateValue(inactivityLengthBeforeLogout, inactivityLengthBeforeLogoutSelectedValue, setAllowDirectMessagesSelectedValue);
                break;
            default: 
                break;
        }
        setEditField(evt.currentTarget.dataset.editfield);
    }

    const showDeleteConfirmation = (evt) => {
        evt.preventDefault();
        setModalContent("delete-profile-confirmation");
    }

    const showResetAllStatsConfirmation = (evt) => {
        evt.preventDefault();
        setModalContent("reset-stats-confirmation");
    }
    
    const handleEditProfilePic = () => {
        setModalContent("photo-options");
    }
    
    const openImageSelector = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.click();
        input.addEventListener("change", (evt) => {
            setPhotoInputValue(evt.target.files[0]);
            setModalContent("profile-pic");
        });
    }

    const handleSaveCrop = (file) => {
        dispatch(updateProfilePic({userId: userId, photo: file}));
        setPhotoInputValue("");
        setModalContent("");
    }

    const displayModalContent = () => {
        switch(modalContent) {
            case "profile-pic":
                return <RegisterProfilePicCropForm photo={URL.createObjectURL(photoInputValue)} saveCrop={handleSaveCrop}/>
            case "delete-profile-confirmation":
                return (
                    <div>
                        <h3>Are you sure you want to delete your profile? All of your deck data, group memberships, and statistics will be erased. This action cannot be undone. If you are the head administrator of any groups you would like to give control of over to someone else you should do so before deleting your account.</h3>
                        <button onClick={hideModal}>Cancel</button>
                        <button onClick={confirmDeleteProfile}>Delete</button>
                    </div>
                );
            case "reset-stats-confirmation":
                return (
                    <div>
                        <h3>Are you sure you want to delete statistics for all of your previous practice sessions of your own decks ? This action cannot be undone.</h3>
                        <p><em>(Note: statistics for practice sessions of group decks can only be reset or deleted by the group's administrators)</em></p>
                        <ButtonWrapper>
                            <button className="btn btn-secondary" onClick={hideModal}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmResetAllStats}>Delete</button>
                        </ButtonWrapper>
                    </div>
                );
            case "photo-options":
                return (
                    <ProfilePicEditContainer>
                        {profilePic && <BlockImg alt="user-profile" src={profilePic} />}
                        {!profilePic && <StyledHiOutlineUserCircle />}
                        <div>
                            <button className="btn btn-primary btn-md" onClick={openImageSelector}>Choose New Photo</button>
                            <button className="btn btn-danger btn-md" onClick={deleteProfilePic}>Delete</button>
                        </div>
                    </ProfilePicEditContainer>
                );
            default: 
                break;
        }
    }

    const confirmDeleteProfile = () => {
        dispatch(deleteProfile({userId}));
        hideModal();
    }
    
    const confirmResetAllStats = () => {
        dispatch(resetAllStatistics({userId}))
            .then(() => {
                dispatch(resetStats());
            });
        hideModal();
    }

    const handleCancel = (evt) => {
        evt.preventDefault();
        setEditField("");
        if(errorMessage) {
            setErrorMessage("");
            setErrorField("");
        }
    }
    
    const handleSave = async (evt) => {
        evt.preventDefault();
        if(errorMessage) {
            setErrorMessage("");
        }

        switch(evt.currentTarget.dataset.editfield) {
            case "email":
                let emailResponse = await axios.get(`${baseURL}/login/emails?email=${emailInputValue}`);
                if(emailResponse.data.emailAvailable) {
                    dispatchActionThenClearEditField(updateUser({userId, userUpdates: {login: {email: emailInputValue}}}));
                } else {
                    setErrorField("email");
                    setErrorMessage("An account with this email already exists");
                }
                break;
            case "username":
                let usernameResponse = await axios.get(`${baseURL}/login/usernames?username=${usernameInputValue}`);
                if(usernameResponse.data.usernameAvailable) {
                    dispatchActionThenClearEditField(updateUser({userId, userUpdates: {login: {username: usernameInputValue}}}));
                } else {
                    setErrorField("username");
                    setErrorMessage("This username is taken");
                }
                break;
            case "first-name":
                dispatchActionThenClearEditField(updateUser({userId, userUpdates: {name: 
                    {
                        first: firstNameInputValue,
                        last: lastNameInputValue,
                        displayPronouns: displayPronounsInputValue,
                        ...(displayPronounsInputValue && {pronouns: pronounsInputValue})
                    }
                }}));
                break;
            case "last-name":
                dispatchActionThenClearEditField(updateUser({userId, userUpdates: {name: 
                    {
                        first: firstNameInputValue,
                        last: lastNameInputValue,
                        displayPronouns: displayPronounsInputValue,
                        ...(displayPronounsInputValue && {pronouns: pronounsInputValue})
                    }
                }}));
                break;
            case "display-pronouns":
                dispatchActionThenClearEditField(updateUser({userId, userUpdates: {name: 
                    {
                        first: firstNameInputValue,
                        last: lastNameInputValue,
                        displayPronouns: displayPronounsInputValue,
                        ...(displayPronounsInputValue && {pronouns: pronounsInputValue})
                    }
                }}));
                break;
            case "pronouns":
                dispatchActionThenClearEditField(updateUser({userId, userUpdates: {name: 
                    {
                        first: firstNameInputValue,
                        last: lastNameInputValue,
                        displayPronouns: displayPronounsInputValue,
                        pronouns: pronounsInputValue
                    }
                }}));
                break;
            case "password":
                if(passwordInputValue === passwordConfirmInputValue) {
                    dispatchActionThenClearEditField(updateUser({userId, userUpdates: {login: {password: passwordInputValue}}}));
                } else {
                    setErrorField("password");
                    setErrorMessage("The passwords don't match");
                }
                break;
            case "stats-track":
                dispatchActionThenClearEditField(updateUser({userId, userUpdates: {statisticsTracking: statisticsTrackingSelectedValue}}));
                break;
            case "email-privacy":
                dispatchActionThenClearEditField(updatePrivacySettings({userId, patchObj: {email: emailPrivacySelectedValue}}));
                break;
            case "name-privacy":
                dispatchActionThenClearEditField(updatePrivacySettings({userId, patchObj: {name: namePrivacySelectedValue}}));
                break;
            case "profile-photo-privacy":
                dispatchActionThenClearEditField(updatePrivacySettings({userId, patchObj: {profilePhoto: profilePhotoPrivacySelectedValue}}));
                break;
            case "groups-privacy":
                dispatchActionThenClearEditField(updatePrivacySettings({userId, patchObj: {groups: groupsPrivacySelectedValue}}));
                break;
            case "new-decks-privacy":
                dispatchActionThenClearEditField(updatePrivacySettings({userId, patchObj: {newDecks: newDecksPrivacySelectedValue}}));
                break;
            case "current-decks-privacy":
                dispatchActionThenClearEditField(updatePrivacySettings({userId, patchObj: {currentDecks: currentDecksPrivacySelectedValue}}));
                break;
            case "admin-change-notification":
                dispatchActionThenClearEditField(updateNotificationSettings({userId, patchObj: {adminChange: adminChangeNotificationSelectedValue}}));
                break;
            case "deck-added-notification":
                dispatchActionThenClearEditField(updateNotificationSettings({userId, patchObj: {deckAdded: deckAddedNotificationSelectedValue}}));
                break;
            case "group-deleted-notification":
                dispatchActionThenClearEditField(updateNotificationSettings({userId, patchObj: {groupDeleted: groupDeletedNotificationSelectedValue}}));
                break;
            case "head-admin-change-notification":
                dispatchActionThenClearEditField(updateNotificationSettings({userId, patchObj: {headAdminChange: headAdminChangeNotificationSelectedValue}}));
                break;
            case "new-member-joined-notification":
                dispatchActionThenClearEditField(updateNotificationSettings({userId, patchObj: {newMemberJoined: newMemberJoinedNotificationSelectedValue}}));
                break;
            case "removed-from-group-notification":
                dispatchActionThenClearEditField(updateNotificationSettings({userId, patchObj: {removedFromGroup: removedFromGroupNotificationSelectedValue}}));
                break;
            case "card-decision-message":
                dispatchActionThenClearEditField(updateEmailPreferences({userId, patchObj: {cardDecision: cardDecisionMessageSelectedValue}}));
                break;
            case "card-submission-message":
                dispatchActionThenClearEditField(updateEmailPreferences({userId, patchObj: {cardSubmission: cardSubmissionMessageSelectedValue}}));
                break;
            case "deck-decision-message":
                dispatchActionThenClearEditField(updateEmailPreferences({userId, patchObj: {deckDecision: deckDecisionMessageSelectedValue}}));
                break;
            case "direct-message":
                dispatchActionThenClearEditField(updateEmailPreferences({userId, patchObj: {direct: directMessageSelectedValue}}));
                break;
            case "group-invitation-message":
                dispatchActionThenClearEditField(updateEmailPreferences({userId, patchObj: {groupInvitation: groupInvitationMessageSelectedValue}}));
                break;
            case "invitation-decision-message":
                dispatchActionThenClearEditField(updateEmailPreferences({userId, patchObj: {invitationDecision: invitationDecisionMessageSelectedValue}}));
                break;
            case "deck-submission-message":
                dispatchActionThenClearEditField(updateEmailPreferences({userId, patchObj: {deckSubmission: deckSubmissionMessageSelectedValue}}));
                break;
            case "join-decision-message":
                dispatchActionThenClearEditField(updateEmailPreferences({userId, patchObj: {joinDecision: joinDecisionMessageSelectedValue}}));
                break;
            case "join-request-message":
                dispatchActionThenClearEditField(updateEmailPreferences({userId, patchObj: {joinRequest: joinRequestMessageSelectedValue}}));
                break;
            case "allow-direct-messages":
                dispatchActionThenClearEditField(updateDirectMessagePreference({userId, allowDirectMessages: allowDirectMessagesSelectedValue}));
                break;
            case "inactivity-length-before-logout":
                dispatchActionThenClearEditField(updateUser({userId, userUpdates: {inactivityLengthBeforeLogout: inactivityLengthBeforeLogoutSelectedValue}}));
                break;
            default:       
                break;
        }
    }

    const deleteProfilePic = () => {
        dispatch(updateProfilePic({userId: userId, photo: undefined}))
            .then(() => {
                setModalContent("");
            });
    }
    
    return (
        <UserSettingsWrapper>
            
            <SettingsForm>
                <ProfilePicContainer>
                    {profilePic && <ProfilePic alt="Profile" src={profilePic} />}
                    {!profilePic && <StyledHiOutlineUserCircle />}

                    <StyledPhotoEditIcon role="button" data-editfield="profile-pic" avatar={!profilePic} onClick={handleEditProfilePic} />
                </ProfilePicContainer>
                <SettingsSection>
                    <SettingsCategoryLabel>Profile</SettingsCategoryLabel>
                    <SettingsCategoryOptions>
                        <SettingCategoryOption>
                            <div>
                                <span>Email: </span>
                                {editField !== "email" && <span>{email}</span>}
                                {editField === "email" && <input type="email" value={emailInputValue} onChange={handleEmailInputValueChange} />}
                            </div>
                            {editField !== "email" && <div><StyledEditIcon role="button" data-editfield="email" onClick={handleEditSelection}/></div>}
                            {editField === "email" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="email" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        {(errorMessage && errorField === "email") && 
                            <ErrorAlert role="alert">
                                {errorMessage}
                            </ErrorAlert>
                        }
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Username: </span>
                                {editField !== "username" && <span>{username}</span>}
                                {editField === "username" && <input type="text" value={usernameInputValue} onChange={handleUsernameInputValueChange} />}
                            </div>
                            {editField !== "username" && <div><StyledEditIcon role="button" data-editfield="username" onClick={handleEditSelection}/></div>}
                            {editField === "username" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="username" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        {(errorMessage && errorField === "username") && 
                            <ErrorAlert role="alert">
                                {errorMessage}
                            </ErrorAlert>
                        }
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>First Name: </span>
                                {editField !== "first-name" && <span>{firstName}</span>}
                                {editField === "first-name" && <input type="text" value={firstNameInputValue} onChange={handleFirstNameInputValueChange} />}
                            </div>
                            {editField !== "first-name" && <div><StyledEditIcon role="button" data-editfield="first-name" onClick={handleEditSelection}/></div>}
                            {editField === "first-name" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="first-name" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Last Name: </span>
                                {editField !== "last-name" && <span>{lastName}</span>}
                                {editField === "last-name" && <input type="text" value={lastNameInputValue} onChange={handleLastNameInputValueChange} />}
                            </div>
                            {editField !== "last-name" && <div><StyledEditIcon role="button" data-editfield="last-name" onClick={handleEditSelection}/></div>}
                            {editField === "last-name" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="last-name" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Display Pronouns: </span>
                                {editField !== "display-pronouns" && <span>{displayPronouns ? "On" : "Off"}</span>}
                                {editField === "display-pronouns" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleDisplayPronounsInputValueChange} checked={displayPronounsInputValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{displayPronounsInputValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "display-pronouns" && <div><StyledEditIcon role="button" data-editfield="display-pronouns" onClick={handleEditSelection}/></div>}
                            {editField === "display-pronouns" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="display-pronouns" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Pronouns: </span>
                                {editField !== "pronouns" && <span>{pronouns === "he" ? "He/Him/His" : pronouns === "she" ? "She/Her/Hers" : "They/Them/Theirs"}</span>}
                                {editField === "pronouns" && 
                                    <select name="pronouns-select" id="pronouns-select" value={pronounsInputValue} onChange={handlePronounsInputValueChange} >
                                        <option value="he">He/Him/His</option>
                                        <option value="she">She/Her/Hers</option>
                                        <option value="they">They/Them/Theirs</option>
                                    </select>
                                }
                            </div>
                            {editField !== "pronouns" && <div><StyledEditIcon role="button" data-editfield="pronouns" onClick={handleEditSelection}/></div>}
                            {editField === "pronouns" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="pronouns" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Password: </span>
                                {editField !== "password" && <span>••••••••••</span>}
                                {editField === "password" && <input type="password" value={passwordInputValue} onChange={handlePasswordInputValueChange} />}
                            </div>
                            {editField !== "password" && <div><StyledEditIcon role="button" data-editfield="password" onClick={handleEditSelection}/></div>}
                            {(editField === "password" && !passwordInputValue) && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    {/* <button data-editfield="username" onClick={handleSave}>Save</button> */}
                                </div>
                            }
                        </SettingCategoryOption>
                        {(passwordInputValue && editField === "password") &&
                            <>
                            <SettingCategoryOption>
                                <div>
                                    <span>Confirm: </span><span style={{opacity: 0}}>d</span>
                                    <input type="password" value={passwordConfirmInputValue} onChange={handlePasswordConfirmInputValueChange} />
                                </div>
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="password" onClick={handleSave}>Save</button>
                                </div>
                        
                            </SettingCategoryOption>
                            {(errorMessage && errorField === "password") && 
                                <ErrorAlert role="alert">
                                    {errorMessage}
                                </ErrorAlert>
                            }
                            </>
                        }
                    </SettingsCategoryOptions>
                </SettingsSection>
                <SettingsSection>
                    <SettingsCategoryLabel>Statistics</SettingsCategoryLabel>
                    <SettingsCategoryOptions>
                        <SettingCategoryOption>
                                <div>
                                    <span>Track: </span>
                                    {editField !== "stats-track" && <span>{statisticsTracking === "all" ? "My Decks and Group Decks" : statisticsTracking === "user-only" ? "My Decks Only" : statisticsTracking === "group-only" ? "Group Decks Only" : "Don't Track"}</span>}
                                    {editField === "stats-track" && 
                                        <select name="stats-track-select" id="stats-track-select" value={statisticsTrackingSelectedValue} onChange={handleStatisticsTrackingSelectedValueChange} >
                                            <option value="all">My Decks and Group Decks</option>
                                            <option value="user-only">My Decks Only</option>
                                            <option value="group-only">Group Decks Only</option>
                                            <option value="none">Don't Track</option>
                                        </select>
                                    }
                                </div>
                                {editField !== "stats-track" && <div><StyledEditIcon role="button" data-editfield="stats-track" onClick={handleEditSelection}/></div>}
                                {editField === "stats-track" && 
                                    <div>
                                        <button onClick={handleCancel}>Cancel</button>
                                        <button data-editfield="stats-track" onClick={handleSave}>Save</button>
                                    </div>
                                }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                                <div>
                                    <span>Reset all stats:</span>
                                </div>
                                <button className="btn btn-danger" onClick={showResetAllStatsConfirmation}>Reset</button>
                        </SettingCategoryOption>
                    </SettingsCategoryOptions>
                </SettingsSection>
                <SettingsSection>
                    <SettingsCategoryLabel>Privacy</SettingsCategoryLabel>
                    <SettingsCategoryOptions>
                        <SettingCategoryOption>
                            <div>
                                <span>Email: </span>
                                {editField !== "email-privacy" && <span>{emailPrivacy === "public" ? "Public" : "Private"}</span>}
                                {editField === "email-privacy" && 
                                    <select name="email-privacy-select" id="email-privacy-select" value={emailPrivacySelectedValue} onChange={handleEmailPrivacySelectedValueChange} >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </select>
                                }
                            </div>
                            {editField !== "email-privacy" && <div><StyledEditIcon role="button" data-editfield="email-privacy" onClick={handleEditSelection}/></div>}
                            {editField === "email-privacy" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="email-privacy" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Name: </span>
                                {editField !== "name-privacy" && <span>{namePrivacy === "public" ? "Public" : "Private"}</span>}
                                {editField === "name-privacy" && 
                                    <select name="name-privacy-select" id="name-privacy-select" value={namePrivacySelectedValue} onChange={handleNamePrivacySelectedValueChange} >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </select>
                                }
                            </div>
                            {editField !== "name-privacy" && <div><StyledEditIcon role="button" data-editfield="name-privacy" onClick={handleEditSelection}/></div>}
                            {editField === "name-privacy" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="name-privacy" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Profile Photo: </span>
                                {editField !== "profile-photo-privacy" && <span>{profilePhotoPrivacy === "public" ? "Public" : "Private"}</span>}
                                {editField === "profile-photo-privacy" && 
                                    <select name="profile-photo-privacy-select" id="profile-photo-privacy-select" value={profilePhotoPrivacySelectedValue} onChange={handleProfilePhotoPrivacySelectedValueChange} >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </select>
                                }
                            </div>
                            {editField !== "profile-photo-privacy" && <div><StyledEditIcon role="button" data-editfield="profile-photo-privacy" onClick={handleEditSelection}/></div>}
                            {editField === "profile-photo-privacy" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="profile-photo-privacy" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Groups: </span>
                                {editField !== "groups-privacy" && <span>{groupsPrivacy === "public" ? "Public" : "Private"}</span>}
                                {editField === "groups-privacy" && 
                                    <select name="groups-privacy-select" id="groups-privacy-select" value={groupsPrivacySelectedValue} onChange={handleGroupsPrivacySelectedValueChange} >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </select>
                                }
                            </div>
                            {editField !== "groups-privacy" && <StyledEditIcon role="button" data-editfield="groups-privacy" onClick={handleEditSelection}/>}
                            {editField === "groups-privacy" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="groups-privacy" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>New Decks: </span>
                                {editField !== "new-decks-privacy" && <span>{newDecksPrivacy === "public" ? "Default to Public" : "Default to Private"}</span>}
                                {editField === "new-decks-privacy" && 
                                    <select name="new-decks-privacy-select" id="new-decks-privacy-select" value={newDecksPrivacySelectedValue} onChange={handleNewDecksPrivacySelectedValueChange} >
                                        <option value="public">Default to Public</option>
                                        <option value="private">Default to Private</option>
                                    </select>
                                }
                            </div>
                            {editField !== "new-decks-privacy" && <StyledEditIcon role="button" data-editfield="new-decks-privacy" onClick={handleEditSelection}/>}
                            {editField === "new-decks-privacy" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="new-decks-privacy" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Current Decks: </span>
                                {editField !== "current-decks-privacy" && <span>{currentDecksPrivacy === "public" ? "All Public" : currentDecksPrivacy === "private" ? "All Private" : "Select Individually"}</span>}
                                {editField === "current-decks-privacy" && 
                                    <select name="current-decks-privacy-select" id="current-decks-privacy-select" value={currentDecksPrivacySelectedValue} onChange={handleCurrentDecksPrivacySelectedValueChange} >
                                        <option value="set-individually">Set Individually</option>
                                        <option value="public">All Public</option>
                                        <option value="private">All Private</option>
                                    </select>
                                }
                            </div>
                            {editField !== "current-decks-privacy" && <div><StyledEditIcon role="button" data-editfield="current-decks-privacy" onClick={handleEditSelection}/></div>}
                            {editField === "current-decks-privacy" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="current-decks-privacy" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                    </SettingsCategoryOptions>
                </SettingsSection>
                <SettingsSection>
                    <SettingsCategoryLabel>Notifications</SettingsCategoryLabel>
                    <SettingsCategoryOptions>
                        <SettingCategoryOption>
                            <div>
                                <span>I Am Added or Removed as a Group Administrator: </span>
                                {editField !== "admin-change-notification" && <span>{adminChangeNotification ? "On" : "Off"}</span>}
                                {editField === "admin-change-notification" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleAdminChangeNotificationSelectedValueChange} checked={adminChangeNotificationSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{adminChangeNotificationSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "admin-change-notification" && <div><StyledEditIcon role="button" data-editfield="admin-change-notification" onClick={handleEditSelection}/></div>}
                            {editField === "admin-change-notification" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="admin-change-notification" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Deck Added to a Group I Am In: </span>
                                {editField !== "deck-added-notification" && <span>{deckAddedNotification ? "On" : "Off"}</span>}
                                {editField === "deck-added-notification" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleDeckAddedNotificationSelectedValueChange} checked={deckAddedNotificationSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{deckAddedNotificationSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "deck-added-notification" && <div><StyledEditIcon role="button" data-editfield="deck-added-notification" onClick={handleEditSelection}/></div>}
                            {editField === "deck-added-notification" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="deck-added-notification" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Group I Am in is Deleted: </span>
                                {editField !== "group-deleted-notification" && <span>{groupDeletedNotification ? "On" : "Off"}</span>}
                                {editField === "group-deleted-notification" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleGroupDeletedNotificationSelectedValueChange} checked={groupDeletedNotificationSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{groupDeletedNotificationSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "group-deleted-notification" && <div><StyledEditIcon role="button" data-editfield="group-deleted-notification" onClick={handleEditSelection}/></div>}
                            {editField === "group-deleted-notification" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="group-deleted-notification" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Group Head Administrator Changes: </span>
                                {editField !== "head-admin-change-notification" && <span>{headAdminChangeNotification ? "On" : "Off"}</span>}
                                {editField === "head-admin-change-notification" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleHeadAdminChangeNotificationSelectedValueChange} checked={headAdminChangeNotificationSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{headAdminChangeNotificationSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "head-admin-change-notification" && <div><StyledEditIcon role="button" data-editfield="head-admin-change-notification" onClick={handleEditSelection}/></div>}
                            {editField === "head-admin-change-notification" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="head-admin-change-notification" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>New Member Joins a Group I Am In: </span>
                                {editField !== "new-member-joined-notification" && <span>{newMemberJoinedNotification ? "On" : "Off"}</span>}
                                {editField === "new-member-joined-notification" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleNewMemberJoinedNotificationSelectedValueChange} checked={newMemberJoinedNotificationSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{newMemberJoinedNotificationSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "new-member-joined-notification" && <div><StyledEditIcon role="button" data-editfield="new-member-joined-notification" onClick={handleEditSelection}/></div>}
                            {editField === "new-member-joined-notification" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="new-member-joined-notification" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>I Am Removed From a Group I Am In: </span>
                                {editField !== "removed-from-group-notification" && <span>{removedFromGroupNotification ? "On" : "Off"}</span>}
                                {editField === "removed-from-group-notification" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleRemovedFromGroupNotificationSelectedValueChange} checked={removedFromGroupNotificationSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{removedFromGroupNotificationSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "removed-from-group-notification" && <div><StyledEditIcon role="button" data-editfield="removed-from-group-notification" onClick={handleEditSelection}/></div>}
                            {editField === "removed-from-group-notification" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="removed-from-group-notification" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                    </SettingsCategoryOptions>
                </SettingsSection>
                <SettingsSection>
                    <SettingsCategoryLabel>Emails</SettingsCategoryLabel>
                    <SettingsCategoryOptions>
                        <SettingCategoryOption>
                            <div>
                                <span>Card I Submitted to Group Deck Was Approved/Denied: </span>
                                {editField !== "card-decision-message" && <span>{cardDecisionMessage ? "On" : "Off"}</span>}
                                {editField === "card-decision-message" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleCardDecisionMessageSelectedValueChange} checked={cardDecisionMessageSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{cardDecisionMessageSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "card-decision-message" && <div><StyledEditIcon role="button" data-editfield="card-decision-message" onClick={handleEditSelection}/></div>}
                            {editField === "card-decision-message" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="card-decision-message" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Card Submitted Deck in Group I am Admin Of: </span>
                                {editField !== "card-submission-message" && <span>{cardSubmissionMessage ? "On" : "Off"}</span>}
                                {editField === "card-submission-message" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleCardSubmissionMessageSelectedValueChange} checked={cardSubmissionMessageSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{cardSubmissionMessageSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "card-submission-message" && <StyledEditIcon role="button" data-editfield="card-submission-message" onClick={handleEditSelection}/>}
                            {editField === "card-submission-message" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="card-submission-message" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Deck I Submitted to Group Was Approved/Denied: </span>
                                {editField !== "deck-decision-message" && <span>{deckDecisionMessage ? "On" : "Off"}</span>}
                                {editField === "deck-decision-message" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleDeckDecisionMessageSelectedValueChange} checked={deckDecisionMessageSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{deckDecisionMessageSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "deck-decision-message" && <div><StyledEditIcon role="button" data-editfield="deck-decision-message" onClick={handleEditSelection}/></div>}
                            {editField === "deck-decision-message" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="deck-decision-message" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Deck Submitted to Group I am Admin Of: </span>
                                {editField !== "deck-submission-message" && <span>{deckSubmissionMessage ? "On" : "Off"}</span>}
                                {editField === "deck-submission-message" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleDeckSubmissionMessageSelectedValueChange} checked={deckSubmissionMessageSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{deckSubmissionMessageSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "deck-submission-message" && <div><StyledEditIcon role="button" data-editfield="deck-submission-message" onClick={handleEditSelection}/></div>}
                            {editField === "deck-submission-message" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="deck-submission-message" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>Direct Messages from Other Users: </span>
                                {editField !== "direct-message" && <span>{directMessage ? "On" : "Off"}</span>}
                                {editField === "direct-message" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleDirectMessageSelectedValueChange} checked={directMessageSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{directMessageSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "direct-message" && <div><StyledEditIcon role="button" data-editfield="direct-message" onClick={handleEditSelection}/></div>}
                            {editField === "direct-message" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="direct-message" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>I Am Invited to Join a Group: </span>
                                {editField !== "group-invitation-message" && <span>{groupInvitationMessage ? "On" : "Off"}</span>}
                                {editField === "group-invitation-message" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleGroupInvitationMessageSelectedValueChange} checked={groupInvitationMessageSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{groupInvitationMessageSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "group-invitation-message" && <div><StyledEditIcon role="button" data-editfield="group-invitation-message" onClick={handleEditSelection}/></div>}
                            {editField === "group-invitation-message" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="group-invitation-message" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>User Responds to Invitation to Join Group I am Admin Of: </span>
                                {editField !== "invitation-decision-message" && <span>{invitationDecisionMessage ? "On" : "Off"}</span>}
                                {editField === "invitation-decision-message" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleInvitationDecisionMessageSelectedValueChange} checked={invitationDecisionMessageSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{invitationDecisionMessageSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "invitation-decision-message" && <div><StyledEditIcon role="button" data-editfield="invitation-decision-message" onClick={handleEditSelection}/></div>}
                            {editField === "invitation-decision-message" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="invitation-decision-message" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>My Request to Join a Group Was Approved/Denied: </span>
                                {editField !== "join-decision-message" && <span>{joinDecisionMessage ? "On" : "Off"}</span>}
                                {editField === "join-decision-message" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleJoinDecisionMessageSelectedValueChange} checked={joinDecisionMessageSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{joinDecisionMessageSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "join-decision-message" && <div><StyledEditIcon role="button" data-editfield="join-decision-message" onClick={handleEditSelection}/></div>}
                            {editField === "join-decision-message" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="join-decision-message" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                            <div>
                                <span>User Requests to Join Group I am Admin Of: </span>
                                {editField !== "join-request-message" && <span>{joinRequestMessage ? "On" : "Off"}</span>}
                                {editField === "join-request-message" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleJoinRequestMessageSelectedValueChange} checked={joinRequestMessageSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{joinRequestMessageSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "join-request-message" && <div><StyledEditIcon role="button" data-editfield="join-request-message" onClick={handleEditSelection}/></div>}
                            {editField === "join-request-message" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="join-request-message" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                    </SettingsCategoryOptions>
                </SettingsSection>
                <SettingsSection>
                    <SettingsCategoryLabel>Social</SettingsCategoryLabel>
                    <SettingsCategoryOptions>
                        <SettingCategoryOption>
                            <div>
                                <span>Allow Other Users to Message Me Directly: </span>
                                {editField !== "allow-direct-messages" && <span>{allowDirectMessages ? "On" : "Off"}</span>}
                                {editField === "allow-direct-messages" && 
                                    <div style={{display: "inline-block"}} className="form-check form-switch">
                                        <input role="button" onChange={handleAllowDirectMessagesSelectedValueChange} checked={allowDirectMessagesSelectedValue} className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" />
                                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">{allowDirectMessagesSelectedValue ? "On" : "Off"}</label>
                                    </div>
                                }
                            </div>
                            {editField !== "allow-direct-messages" && <div><StyledEditIcon role="button" data-editfield="allow-direct-messages" onClick={handleEditSelection}/></div>}
                            {editField === "allow-direct-messages" && 
                                <div>
                                    <button onClick={handleCancel}>Cancel</button>
                                    <button data-editfield="allow-direct-messages" onClick={handleSave}>Save</button>
                                </div>
                            }
                        </SettingCategoryOption>
                    </SettingsCategoryOptions>
                </SettingsSection>
                <SettingsSection>
                    <SettingsCategoryLabel>Security</SettingsCategoryLabel>
                    <SettingsCategoryOptions>
                        <SettingCategoryOption>
                                <div>
                                    {/* <span>{inactivityLengthBeforeLogout < 86400001 ? "" : ""}</span> */}
                                    <span>Length of Inactivity Before Being Automatically Logged Out: </span>
                                    {editField !== "inactivity-length-before-logout" && <span>{inactivityLengthBeforeLogout !== "never" ? Number(inactivityLengthBeforeLogout) < 1800001 ? "30 Minutes" : `${Number(inactivityLengthBeforeLogout)/1000/60/60} hour${inactivityLengthBeforeLogout !== "3600000" ? "s" : ""}` : "Don't Log Me Out Due to Inactivity"}</span>}
                                    {editField === "inactivity-length-before-logout" && 
                                        <select name="inactivity-length-before-logout-select" id="inactivity-length-before-logout-select" value={inactivityLengthBeforeLogoutSelectedValue} onChange={handleInactivityLengthBeforeLogoutSelectedValueChange} >
                                            <option value="never">Never Log Me Out Due to Inactivity</option>
                                            <option value="1800000">30 Minutes</option>
                                            <option value="3600000">1 hour</option>
                                            <option value="7200000">2 hours</option>
                                            <option value="10800000">3 hours</option>
                                            <option value="14400000">4 hours</option>
                                            <option value="28800000">8 hours</option>
                                            <option value="43200000">12 hours</option>
                                            <option value="86400000">24 hours</option>
                                        </select>
                                    }
                                </div>
                                {editField !== "inactivity-length-before-logout" && <div><StyledEditIcon role="button" data-editfield="inactivity-length-before-logout" onClick={handleEditSelection}/></div>}
                                {editField === "inactivity-length-before-logout" && 
                                    <div>
                                        <button onClick={handleCancel}>Cancel</button>
                                        <button data-editfield="inactivity-length-before-logout" onClick={handleSave}>Save</button>
                                    </div>
                                }
                            </SettingCategoryOption>
                    </SettingsCategoryOptions>
                </SettingsSection>
                <StyledButton className="btn btn-danger" onClick={showDeleteConfirmation}>Delete Account</StyledButton>
            </SettingsForm>
            {modalContent &&
                <Modal hideModal={hideModal}>
                    {displayModalContent()}
                </Modal>
            }
        </UserSettingsWrapper>
    );
}

export default UserSettings;