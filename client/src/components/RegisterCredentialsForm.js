import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { signUp } from '../reducers/loginSlice';
import styled from 'styled-components';
import useToggle from '../hooks/useToggle';
import { ErrorMessage } from './StyledComponents/ErrorMessage';
import { PasswordWrapper, StyledClosedEye, StyledOpenEye } from './StyledComponents/Password';

const FormWrapper = styled.form`
    & input {
        width: 100%;
    }
`;


const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function RegisterCredentialsForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showVerifyPassword, setShowVerifyPassword] = useState(false);
    const [verifyPassword, clearVerifyPassword, setVerifyPassword] = useFormInput('');
    const [passwordVisible, togglePasswordVisible] = useToggle(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleEmailChange = (evt) => {
        setEmail(evt.target.value);
        if(errorMessage) {
            setErrorMessage("");
        }
    }

    const handlePasswordChange = (evt) => {
        setPassword(evt.target.value);
        if(errorMessage) {
            setErrorMessage("");
        }
    }
    
    const handleSubmit = async (evt) => {
        evt.preventDefault();
        if(password === verifyPassword) {
            let response = await axios.get(`${baseURL}/users/emails?email=${email}`);
            if(response.data.emailAvailable) {
                localStorage.removeItem("token");
                dispatch(signUp({email, password}))
                    .then(action => {
                        if(!action?.payload?.token === "Unauthorized") {
                            setErrorMessage("Either your username or password are incorrect");
                        } else {
                            localStorage.setItem("token", action.payload.token);
                        }
                    });  
                navigate("/register/email-verification");
            } else {
                setErrorMessage("An account with this email already exists");
            }
            setEmail("");
            setPassword("");
            clearVerifyPassword();
        } else {
            setPassword("");
            clearVerifyPassword();
            setErrorMessage("Passwords do not match");
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
            <FormWrapper onSubmit={handleSubmit}>
                <div>
                    <input placeholder="email" type="email" id="email" name="email" value={email} onChange={handleEmailChange} />
                </div>
                <PasswordWrapper>
                    <input placeholder="password" type={passwordVisible ? "text" : "password"} id="password" name="password" value={password} onChange={handlePasswordChange} />
                    {!passwordVisible && <StyledOpenEye onClick={togglePasswordVisible} />}
                    {passwordVisible && <StyledClosedEye onClick={togglePasswordVisible} />}
                </PasswordWrapper> 
                {showVerifyPassword ? 
                    <PasswordWrapper>
                        <input placeholder="verify password" type={passwordVisible ? "text" : "password"} id="verifyPassword" name="verifyPassword" value={verifyPassword} onChange={setVerifyPassword} />
                        {!passwordVisible && <StyledOpenEye onClick={togglePasswordVisible} />}
                        {passwordVisible && <StyledClosedEye onClick={togglePasswordVisible} />}
                    </PasswordWrapper> 
                    :
                    null
                }
                {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
                <button type="submit">Submit</button>
            </FormWrapper>
        </div>
    )
}

export default RegisterCredentialsForm;