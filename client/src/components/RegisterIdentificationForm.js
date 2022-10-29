import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { updateUser } from '../reducers/loginSlice';

function RegisterIdentificationForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [username, clearUsername, setUsername] = useFormInput('');
    const [firstName, clearFirstName, setFirstName] = useFormInput('');
    const [lastName, clearLastName, setLastName] = useFormInput('');
    const [photo, clearPhoto, setPhoto] = useFormInput('');
    const userId = useSelector((state) => state.login.userId);
    const name = useSelector((state) => state.login.name);

    const handleSubmit = evt => {
        evt.preventDefault();
        console.log("about to dispatch register identification action");
        dispatch(updateUser({userId, userUpdates: {login: {username: username}, name: {first: firstName, last: lastName}, photo}}))
        .then(() => {
            console.log("action complete, about to go to join groups");
            navigate("/register/join-groups");
            clearUsername();
            clearFirstName();
            clearLastName();
            clearPhoto();
        });
    }

    useEffect(() => {
        if(!userId) {
            navigate("/");
        }
        if(name?.first) {
            navigate("/dashboard");
        }
    }, [name, navigate, userId]);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username (optional)</label>
                    <input type="text" id="username" name="username" value={username} onChange={setUsername} />
                </div>
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
                    <input type="text" id="photo" name="photo" value={photo} onChange={setPhoto} />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default RegisterIdentificationForm;