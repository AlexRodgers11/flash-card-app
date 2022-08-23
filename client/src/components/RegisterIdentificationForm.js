import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { setIdentificationData } from '../reducers/loginSlice';
// import { register } from '../reducers/loginSlice';

function RegisterIdentificationForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [username, clearUsername, setUsername] = useFormInput('');
    const [firstName, clearFirstName, setFirstName] = useFormInput('');
    const [lastName, clearLastName, setLastName] = useFormInput('');
    const [photo, clearPhoto, setPhoto] = useFormInput('');
    // const [pronouns, clearPronouns, setPronouns] = useFormInput('');
    const user = useSelector((state) => state.login);

    const handleSubmit = evt => {
        evt.preventDefault();
        console.log("about to dispatch register identification action");
        dispatch(setIdentificationData({userId: user.userId, username, firstName, lastName, photo}));
        clearUsername();
        clearFirstName();
        clearLastName();
        clearPhoto();
        // clearPronouns();
    }

    useEffect(() => {
        if(user.name.first) {
            console.log("would redirect from here");
        }
    }, [user]);

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
                {/* <div>
                    <label htmlFor="pronouns">Pronouns (optional)</label>
                    <input type="text" id="pronouns" name="pronouns" value={pronouns} onChange={setPronouns} />
                </div>  */}
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default RegisterIdentificationForm;