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

function RegisterIdentificationForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [username, clearUsername, setUsername] = useFormInput('');
    const [firstName, clearFirstName, setFirstName] = useFormInput('');
    const [lastName, clearLastName, setLastName] = useFormInput('');
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
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username (optional)</label>
                    <input type="text" id="username" name="username" value={username} onChange={setUsername} />
                </div>
                {(errorMessage) && 
                    <ErrorAlert role="alert">
                        {errorMessage}
                    </ErrorAlert>
                }
                <div>
                    <label htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" name="firstName" value={firstName} onChange={setFirstName} />
                </div> 
                <div>
                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" id="lastName" name="lastName" value={lastName} onChange={setLastName} />
                </div>
                <div>
                    <label htmlFor="photo">Photo (optional)</label>
                    <input type="file" accept="image/*" id="photo" name="photo" onChange={handlePhotoChange} />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default RegisterIdentificationForm;