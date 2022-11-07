import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { signUp } from '../reducers/loginSlice';
const baseURL = 'http://localhost:8000';

function RegisterCredentialsForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, clearEmail, setEmail] = useFormInput('');
    const [password, clearPassword, setPassword] = useFormInput('');
    const [showVerifyPassword, setShowVerifyPassword] = useState(false);
    const [verifyPassword, clearVerifyPassword, setVerifyPassword] = useFormInput('');
    const [errorMessage, setErrorMessage] = useState("");
    
    const handleSubmit = async (evt) => {
        evt.preventDefault();
        if(password === verifyPassword) {
            let response = await axios.get(`${baseURL}/users/emails?email=${email}`);
            if(response.data.emailAvailable) {
                dispatch(signUp({email, password}));
                navigate("/register/email-verification");
            } else {
                setErrorMessage("An account with this email already exists");
            }
            clearEmail();
            clearPassword();
            clearVerifyPassword();
        } else {
            clearPassword();
            clearVerifyPassword();
            alert("Passwords do not match");
        }
    }

    useEffect(() => {
        if(password && !showVerifyPassword) {
            setShowVerifyPassword(true);
        } else if(!password && showVerifyPassword) {
            setShowVerifyPassword(false);
        }
    }, [password, showVerifyPassword]);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={email} onChange={setEmail} />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" value={password} onChange={setPassword} />
                </div> 
                {showVerifyPassword ? 
                    <div>
                        <label htmlFor="verifyPassword">Verify Password</label>
                        <input type="password" id="verifyPassword" name="verifyPassword" value={verifyPassword} onChange={setVerifyPassword} />
                    </div> 
                    :
                    null
                }
                <button type="submit">Submit</button>
                {(errorMessage && (!email.length && !password.length)) && <p>{errorMessage}</p>}
            </form>
        </div>
    )
}

export default RegisterCredentialsForm;