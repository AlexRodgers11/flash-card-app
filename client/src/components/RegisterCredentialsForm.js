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
    const [userEnteredVerificationCode, clearUserEnteredVerificationCode, handleUserEnteredVerificationCodeChange] = useFormInput("");
    const [awaitingVerification, setAwaitingVerification] = useState(false);
    const [verificationResponse, setVerificationResponse] = useState("");
    const [showVerifyPassword, setShowVerifyPassword] = useState(false);
    const [verifyPassword, clearVerifyPassword, setVerifyPassword] = useFormInput('');
    const [errorMessage, setErrorMessage] = useState("");
    const userId = useSelector((state) => state.login.userId);

    const checkValidationCode = async (evt) => {
        evt.preventDefault();
        try {
            await axios.patch(`${baseURL}/users/${userId}/verification`, {code: userEnteredVerificationCode});
            clearUserEnteredVerificationCode();
            console.log("made it into correct case");
            navigate("/register/identification");
        } catch (err) {
            clearUserEnteredVerificationCode();
            switch(err.response.data.verificationResponse) {
                case "invalid":
                    setVerificationResponse("invalid");
                    break;
                case "expired":
                    setVerificationResponse("expired");
                    break;
                default:
                    setVerificationResponse("");
                    break;
            }
        }
    }


    const displayVerificationError = () => {
        if(verificationResponse === "invalid") {
            return (
                <p>Invalid code</p>
            );
        } else if (verificationResponse === "expired") {
            return (
                <p>Code expired. A new one has been sent to your email.</p>
            );
        }
    }    
    const handleSubmit = async (evt) => {
        evt.preventDefault();
        if(password === verifyPassword) {
            let response = await axios.get(`${baseURL}/users/emails?email=${email}`);
            if(response.data.emailAvailable) {
                dispatch(signUp({email, password}));
                setAwaitingVerification(true);
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
            {!awaitingVerification ? 
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
                :
                <form onSubmit={checkValidationCode}>
                    <div>
                        <label htmlFor="verification-code">Enter the verification code sent to the email you provided</label>
                        <input type="text" id="verification-code" name="verification-code" value={userEnteredVerificationCode} onChange={handleUserEnteredVerificationCodeChange} />
                        {!verificationResponse || userEnteredVerificationCode.length > 0 ? null : displayVerificationError()}
                    </div>
                    <button type="submit">Submit</button>
                </form>
            }
        </div>
    )
}

export default RegisterCredentialsForm;