import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { signUp } from '../reducers/loginSlice';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styled from 'styled-components';
import useToggle from '../hooks/useToggle';
import { ErrorMessage } from './StyledComponents/ErrorMessage';

const PasswordWrapper = styled.div`
    position: relative;
`;

const StyledOpenEye = styled(AiOutlineEye)`
    position: absolute;
    right: 4%;
    top: 28%;
`;

const StyledClosedEye = styled(AiOutlineEyeInvisible)`
    position: absolute;
    right: 4%;
    top: 28%;
`;

const FormWrapper = styled.form`
    & input {
        width: 100%;
    }
`;


const baseURL = 'http://localhost:8000';

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
                dispatch(signUp({email, password}));
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