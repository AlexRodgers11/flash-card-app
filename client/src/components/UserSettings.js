import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { MdModeEditOutline } from "react-icons/md";
import { RiImageEditFill } from "react-icons/ri";
import { deleteProfile, updateProfilePic, updateUser } from "../reducers/loginSlice";
import useFormInput from "../hooks/useFormInput";
import Modal from "./Modal";
import RegisterProfilePicCropForm from "./RegisterProfilePicCropForm"; //probably rename all of these to exclude the word "Register"
import axios from "axios";

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
    const [errorField, setErrorField] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    const [emailInputValue, clearEmailInputValue, handleEmailInputValueChange, setEmailInputValue] = useFormInput(email);
    const [usernameInputValue, clearUsernameInputValue, handleUsernameInputValueChange, setUsernameInputValue] = useFormInput(username);
    const [passwordInputValue, clearPasswordInputValue, handlePasswordInputValueChange, setPasswordInputValue] = useFormInput("");
    const [passwordConfirmInputValue, clearPasswordConfirmInputValue, handlePasswordConfirmInputValueChange, setPasswordConfirmInputValue] = useFormInput("");
    const [photoInputValue, setPhotoInputValue] = useState();
    
    const statisticsTracking = useSelector((state) => state.login.statisticsTracking);
    const [statisticsTrackingSelectedValue, setStatisticsTrackingSelectedValue] = useState("");

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
            default: 
                break;
        }
        setEditField(evt.currentTarget.dataset.editfield);
    }

    const handleStatisticsTrackingSelectedValueChange = (evt) => {
        setStatisticsTrackingSelectedValue(evt.target.value);
    }

    const showDeleteConfirmation = (evt) => {
        evt.preventDefault();
        setModalContent("delete-profile-confirmation");
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
            default: 
                break;
        }
    }

    const confirmDeleteProfile = () => {
        dispatch(deleteProfile({userId}));
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
                                    {editField !== "stats-track" && <span>{statisticsTracking === "all" ? "My Decks and Group Decks" : statisticsTracking === "user-only" ? "My Decks Only" : "Don't Track"}</span>}
                                    {editField === "stats-track" && 
                                        <select name="stats-track-select" id="stats-track-select" value={statisticsTrackingSelectedValue} onChange={handleStatisticsTrackingSelectedValueChange} >
                                            <option value="all">My Decks and Group Decks</option>
                                            <option value="user-only">My Decks Only</option>
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