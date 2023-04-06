import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { MdModeEditOutline } from "react-icons/md";
import { RiImageEditFill } from "react-icons/ri";
import { deleteProfile, resetAllStatistics, updatePrivacySettings, updateProfilePic, updateUser } from "../reducers/loginSlice";
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

const SettingCategoryOption = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    & div span:first-of-type {
        font-weight: 600;
    } 
    & button {
        margin: 0 .15rem; 
    }
    `;
    
const ProfilePicContainer = styled.div`
    position: relative;
    display: inline-flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 2rem;
    & svg {
        position: absolute;
        width: 2rem;
        height: 2rem;
        right: 0rem;
    }
`;

const ProfilePic = styled.img`
    border: 1px solid transparent; 
    border-radius: 50%;
    height: 20rem;
    width: 20rem
`;

const StyledEditIcon = styled(MdModeEditOutline)`
    cursor: pointer;
`;

const StyledPhotoEditIcon = styled(RiImageEditFill)`
    cursor: pointer;
    // background-color: white;
    // background-color: blue;
    border-radius: 10%;
    // padding: .15rem;
`;

const ErrorAlert = styled.div`
    margin-top: .25rem;
    border-radius: .25rem;
    background-color: #f55656;
    color: white;
`;

const StyledButton = styled.button`
    background-color: white;
    padding: .25rem;
`;

function UserSettings() {
    const userId = useSelector((state) => state.login.userId);
    const [modalContent, setModalContent] = useState("");
    const [editField, setEditField] = useState("");
    const username = useSelector((state) => state.login.login.username);
    const email = useSelector((state) => state.login.login.email);
    const profilePic = useSelector((state) => state.login.photo);
    const emailPrivacy = useSelector((state) => state.login.privacy.email);
    const namePrivacy = useSelector((state) => state.login.privacy.name);
    const groupsPrivacy = useSelector((state) => state.login.privacy.groups);
    const profilePhotoPrivacy = useSelector((state) => state.login.privacy.profilePhoto);
    const newDecksPrivacy = useSelector((state) => state.login.privacy.newDecks);
    const currentDecksPrivacy = useSelector((state) => state.login.privacy.currentDecks);

    const [errorField, setErrorField] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    const [emailInputValue, clearEmailInputValue, handleEmailInputValueChange, setEmailInputValue] = useFormInput(email);
    const [usernameInputValue, clearUsernameInputValue, handleUsernameInputValueChange, setUsernameInputValue] = useFormInput(username);
    const [passwordInputValue, clearPasswordInputValue, handlePasswordInputValueChange, setPasswordInputValue] = useFormInput("");
    const [passwordConfirmInputValue, clearPasswordConfirmInputValue, handlePasswordConfirmInputValueChange, setPasswordConfirmInputValue] = useFormInput("");
    const [photoInputValue, setPhotoInputValue] = useState();
    
    const statisticsTracking = useSelector((state) => state.login.statisticsTracking);
    const [statisticsTrackingSelectedValue, clearStatisticsTrackingSelectedValue, handleStatisticsTrackingSelectedValueChange, setStatisticsTrackingSelectedValue] = useFormInput(statisticsTracking);
    const [emailPrivacySelectedValue, clearEmailPrivacySelectedValue, handleEmailPrivacySelectedValueChange, setEmailPrivacySelectedValue] = useFormInput(emailPrivacy);
    const [namePrivacySelectedValue, clearNamePrivacySelectedValue, handleNamePrivacySelectedValueChange, setNamePrivacySelectedValue] = useFormInput(namePrivacy);
    const [groupsPrivacySelectedValue, clearGroupsPrivacySelectedValue, handleGroupsPrivacySelectedValueChange, setGroupsPrivacySelectedValue] = useFormInput(groupsPrivacy);
    const [profilePhotoPrivacySelectedValue, clearProfilePhotoPrivacySelectedValue, handleProfilePhotoPrivacySelectedValueChange, setProfilePhotoPrivacySelectedValue] = useFormInput(profilePhotoPrivacy);
    const [newDecksPrivacySelectedValue, clearNewDecksPrivacySelectedValue, handleNewDecksPrivacySelectedValueChange, setNewDecksPrivacySelectedValue] = useFormInput(newDecksPrivacy);
    const [currentDecksPrivacySelectedValue, clearCurrentDecksPrivacySelectedValue, handleCurrentDecksPrivacySelectedValueChange, setCurrentDecksPrivacySelectedValue] = useFormInput(currentDecksPrivacy);

    const dispatch = useDispatch();

    const hideModal = () => {
        setModalContent("");
    }

    const handleEditSelection = evt => {
        if(errorMessage) {
            setErrorMessage("");
            setErrorField("");
        }
        switch(evt.currentTarget.dataset.editfield) {
            case "email":
                if(email !== emailInputValue) {
                    setEmailInputValue(email);
                }
                break;
            case "username":
                if(username !== usernameInputValue) {
                    setUsernameInputValue(username);
                }
                break;
            case "password":
                setPasswordInputValue("");
                setPasswordConfirmInputValue("");
                break;
            case "stats-track":
                if(statisticsTracking !== statisticsTrackingSelectedValue) {
                    setStatisticsTrackingSelectedValue(statisticsTracking);
                }
                break;
            case "email-privacy":
                if(emailPrivacy !== emailPrivacySelectedValue) {
                    setEmailPrivacySelectedValue(emailPrivacy);
                }
                break;
            case "name-privacy":
                if(namePrivacy !== namePrivacySelectedValue) {
                    setNamePrivacySelectedValue(namePrivacy);
                }
                break;
            case "profile-photo-privacy":
                if(profilePhotoPrivacy !== profilePhotoPrivacySelectedValue) {
                    setProfilePhotoPrivacySelectedValue(profilePhotoPrivacy);
                }
                break;
            case "groups-privacy":
                if(groupsPrivacy !== groupsPrivacySelectedValue) {
                    setGroupsPrivacySelectedValue(groupsPrivacy);
                }
                break;
            case "new-decks-privacy":
                if(newDecksPrivacy !== newDecksPrivacySelectedValue) {
                    setNewDecksPrivacySelectedValue(newDecksPrivacy);
                }
                break;
            case "current-decks-privacy":
                if(currentDecksPrivacy !== currentDecksPrivacySelectedValue) {
                    setCurrentDecksPrivacySelectedValue(currentDecksPrivacy);
                }
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
                        <button onClick={hideModal}>Cancel</button>
                        <button onClick={confirmResetAllStats}>Delete</button>
                    </div>
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
                    dispatch(updateUser({userId, userUpdates: {login: {email: emailInputValue}}}));
                    setEditField("");
                } else {
                    setErrorField("email");
                    setErrorMessage("An account with this email already exists");
                }
                break;
            case "username":
                let usernameResponse = await axios.get(`${baseURL}/login/usernames?username=${usernameInputValue}`);
                if(usernameResponse.data.usernameAvailable) {
                    dispatch(updateUser({userId, userUpdates: {login: {username: usernameInputValue}}}));
                    setEditField("");
                } else {
                    setErrorField("username");
                    setErrorMessage("This username is taken");
                }
                break;
            case "password":
                if(passwordInputValue === passwordConfirmInputValue) {
                    dispatch(updateUser({userId, userUpdates: {login: {password: passwordInputValue}}}));
                    setEditField("");
                } else {
                    setErrorField("password");
                    setErrorMessage("The passwords don't match");
                }
                break;
            case "stats-track":
                dispatch(updateUser({userId, userUpdates: {statisticsTracking: statisticsTrackingSelectedValue}}))
                .then(() => {
                    setEditField("");
                });
                break;
            case "email-privacy":
                dispatch(updatePrivacySettings({userId, patchObj: {email: emailPrivacySelectedValue}}))
                    .then(() => {
                        console.log("testing");
                        setEditField("");
                    });
                break;
            case "name-privacy":
                dispatch(updatePrivacySettings({userId, patchObj: {name: emailPrivacySelectedValue}}))
                    .then(() => {
                        setEditField("");
                    });
                break;
            case "profile-photo-privacy":
                dispatch(updatePrivacySettings({userId, patchObj: {profilePhoto: profilePhotoPrivacySelectedValue}}))
                    .then(() => {
                        setEditField("");
                    });
                break;
            case "groups-privacy":
                dispatch(updatePrivacySettings({userId, patchObj: {groups: groupsPrivacySelectedValue}}))
                    .then(() => {
                        setEditField("");
                    });
                break;
            case "new-decks-privacy":
                dispatch(updatePrivacySettings({userId, patchObj: {newDecks: newDecksPrivacySelectedValue}}))
                    .then(() => {
                        setEditField("");
                    });
                break;
            case "current-decks-privacy":
                dispatch(updatePrivacySettings({userId, patchObj: {currentDecks: currentDecksPrivacySelectedValue}}))
                    .then(() => {
                        setEditField("");
                    });
                break;
            default:       
                break;
        }
    }

    return (
        <UserSettingsWrapper>
            
            <SettingsForm>
                <ProfilePicContainer>
                    <ProfilePic alt="Profile" src={profilePic} />
                    <StyledPhotoEditIcon role="button" data-editfield="profile-pic" onClick={openImageSelector} />
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
                            {editField !== "email" && <StyledEditIcon role="button" data-editfield="email" onClick={handleEditSelection}/>}
                            {editField === "email" && 
                                <div>
                                    <button data-editfield="email" onClick={handleCancel}>Cancel</button>
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
                            {editField !== "username" && <StyledEditIcon role="button" data-editfield="username" onClick={handleEditSelection}/>}
                            {editField === "username" && 
                                <div>
                                    <button data-editfield="username" onClick={handleCancel}>Cancel</button>
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
                                <span>Password: </span>
                                {editField !== "password" && <span>••••••••••</span>}
                                {editField === "password" && <input type="password" value={passwordInputValue} onChange={handlePasswordInputValueChange} />}
                            </div>
                            {editField !== "password" && <StyledEditIcon role="button" data-editfield="password" onClick={handleEditSelection}/>}
                            {(editField === "password" && !passwordInputValue) && 
                                <div>
                                    <button data-editfield="" onClick={handleCancel}>Cancel</button>
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
                                    <button data-editfield="password" onClick={handleCancel}>Cancel</button>
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
                                {editField !== "stats-track" && <StyledEditIcon role="button" data-editfield="stats-track" onClick={handleEditSelection}/>}
                                {editField === "stats-track" && 
                                    <div>
                                        <button data-editfield="" onClick={handleCancel}>Cancel</button>
                                        <button data-editfield="stats-track" onClick={handleSave}>Save</button>
                                    </div>
                                }
                        </SettingCategoryOption>
                        <hr />
                        <SettingCategoryOption>
                                <div>
                                    <span>Reset all stats:</span>
                                </div>
                                <button  onClick={showResetAllStatsConfirmation}>Reset</button>
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
                                {editField !== "email-privacy" && <StyledEditIcon role="button" data-editfield="email-privacy" onClick={handleEditSelection}/>}
                                {editField === "email-privacy" && 
                                    <div>
                                        <button data-editfield="" onClick={handleCancel}>Cancel</button>
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
                                {editField !== "name-privacy" && <StyledEditIcon role="button" data-editfield="name-privacy" onClick={handleEditSelection}/>}
                                {editField === "name-privacy" && 
                                    <div>
                                        <button data-editfield="" onClick={handleCancel}>Cancel</button>
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
                                {editField !== "profile-photo-privacy" && <StyledEditIcon role="button" data-editfield="profile-photo-privacy" onClick={handleEditSelection}/>}
                                {editField === "profile-photo-privacy" && 
                                    <div>
                                        <button data-editfield="" onClick={handleCancel}>Cancel</button>
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
                                        <button data-editfield="" onClick={handleCancel}>Cancel</button>
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
                                        <button data-editfield="" onClick={handleCancel}>Cancel</button>
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
                                {editField !== "current-decks-privacy" && <StyledEditIcon role="button" data-editfield="current-decks-privacy" onClick={handleEditSelection}/>}
                                {editField === "current-decks-privacy" && 
                                    <div>
                                        <button data-editfield="" onClick={handleCancel}>Cancel</button>
                                        <button data-editfield="current-decks-privacy" onClick={handleSave}>Save</button>
                                    </div>
                                }
                        </SettingCategoryOption>
                    </SettingsCategoryOptions>
                </SettingsSection>
                <StyledButton onClick={showDeleteConfirmation}>Delete Account</StyledButton>
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