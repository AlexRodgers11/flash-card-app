import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { updateProfilePic, updateUser } from '../reducers/loginSlice';
import styled from 'styled-components';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const ErrorAlert = styled.div`
    margin: .25rem 0;
    border-radius: .25rem;
    background-color: #f55656;
    color: white;
`;

const RegisterIdentificationFormWrapper = styled.form`
    text-align: left;
    & div {
        margin-top: .5rem;
    }
    & .form-label {
        margin-bottom: 1px;
    }
    & button {
        
    }
`;

const ButtonContainer = styled.div`
    text-align: center;
    margin-top: 1rem;
`;

function RegisterIdentificationForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [username, clearUsername, handleUsernameChange, setUsername] = useFormInput('');
    const [firstName, clearFirstName, handleFirstNameChange, setFirstName] = useFormInput('');
    const [lastName, clearLastName, handleLastNameChange, setLastName] = useFormInput('');
    const [displayPronouns, clearDisplayPronouns, handleDisplayPronounsChange, setDisplayPronouns] = useFormInput(false, "checkbox");
    const [pronouns, clearPronouns, handlePronounsChange, setPronouns] = useFormInput("");
    const [photo, setPhoto] = useState();
    const [errorMessage, setErrorMessage] = useState("");
    const userId = useSelector((state) => state.login.userId);
    const name = useSelector((state) => state.login.name);
    const email = useSelector((state) => state.login.login.email);
    const storedPhoto = useSelector((state) => state.login.photo);

    const handleSubmit = async (evt) => {
        setErrorMessage("");
        evt.preventDefault();
        let usernameResponse = await axios.get(`${baseURL}/login/usernames?username=${username}`);
        if(usernameResponse.data.usernameAvailable) {
            if(photo) {
                console.log({photoInIdentificationForm: photo});
                dispatch(updateProfilePic({userId, photo}));
            }
            dispatch(updateUser({userId, userUpdates: {login: {username: username, email: email}, name: {first: firstName, last: lastName}}}))
                .then(() => {
                    if(photo) {
                        console.log("navigating to profile-pic-crop")
                        navigate("/register/profile-pic-crop");

                    } else {
                        console.log("navigating to join groups")
                        navigate("/register/join-groups");
                    }
                })
                clearUsername();
                clearFirstName();
                clearLastName();
                clearPronouns();
                setDisplayPronouns(false);
                setPhoto("");
                // setEditField("");
            } else {
                // setErrorField("username");
                setErrorMessage("This username is taken");
            }
        
    }

    const handlePhotoChange = (evt) => {
        const file = evt.target.files[0];
        console.log({file})
        setPhoto(file);
    }    

    const firstRender = useRef(true);

    useEffect(() => {
        console.log(firstRender.current);
        if(firstRender.current) {
            if(storedPhoto) {
                console.log("photo exists, should navigate to crop");
                navigate("/register/profile-pic-crop");
            } else if(name?.first) {
                console.log("only have name, should skip to join groups");
                navigate("/register/join-groups");
            }
            firstRender.current = false;
        } else {
            console.log("should be changing firstRender");
        }
    }, [name?.first, navigate, storedPhoto])


    return (
        // <div>
            <RegisterIdentificationFormWrapper onSubmit={handleSubmit}>
                <div>
                    <label className="form-label" htmlFor="username">Username (optional)</label>
                    <input className="form-control" type="text" id="username" name="username" value={username} onChange={handleUsernameChange} />
                </div>
                {(errorMessage) && 
                    <ErrorAlert role="alert">
                        {errorMessage}
                    </ErrorAlert>
                }
                <div>
                    <label className="form-label" htmlFor="firstName">First Name</label>
                    <input className="form-control" type="text" id="firstName" name="firstName" value={firstName} onChange={handleFirstNameChange} />
                </div> 
                <div>
                    <label className="form-label" htmlFor="lastName">Last Name</label>
                    <input className="form-control" type="text" id="lastName" name="lastName" value={lastName} onChange={handleLastNameChange} />
                </div>
                <div className="form-check form-switch">
                    <input style={{display: "inline-block"}} role="button" onChange={handleDisplayPronounsChange} checked={displayPronouns} className="form-control form-check-input" type="checkbox" id="pronoun-display-switch" />
                    <label className="form-check-label" htmlFor="pronoun-display-switch">{displayPronouns ? "Display My Pronouns" : "Don't Display My Pronouns"}</label>
                </div>
                {displayPronouns &&
                    <>
                    <label className="form-check-label" htmlFor="pronouns">Pronouns</label>
                    <select required={displayPronouns} className="form-select" name="pronouns" id="pronouns" value={pronouns} onChange={handlePronounsChange}  >
                        <option value="" default></option>
                        <option value="he">He/Him/His</option>
                        <option value="her">She/Her/Hers</option>
                        <option value="they">They/Them/Theirs</option>
                    </select>
                    </>
                }
                <div>
                    <label className="form-label" htmlFor="photo">Photo (optional)</label>
                    <input className="form-control" type="file" accept="image/*" id="photo" name="photo" onChange={handlePhotoChange} />
                </div>
                <ButtonContainer>
                    <button className="btn btn-primary" type="submit">Submit</button>
                </ButtonContainer>
            </RegisterIdentificationFormWrapper>
        // </div>
    )
}

export default RegisterIdentificationForm;