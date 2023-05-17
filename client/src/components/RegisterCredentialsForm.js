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
import { NavigationSpan } from './StyledComponents/NavigationSpan';

const FormWrapper = styled.form`
    text-align: left;
    & input {
        width: 100%;
        margin-bottom: .5rem;
    }
    & .form-label {
        font-weight: 500;
        margin-bottom: 1px;
    }
`;

const ButtonContainer = styled.div`
    text-align: center;
    margin-bottom: 2.5rem;
`;


const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function RegisterCredentialsForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showVerifyPassword, setShowVerifyPassword] = useState(false);
    const [verifyPassword, clearVerifyPassword, handleVerifyPasswordChange] = useFormInput("");
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

    const goToLogin = () => {
        navigate("/login");
    }
    
    const handleSubmit = async (evt) => {
        evt.preventDefault();
        if(password === verifyPassword) {
            let response = await axios.get(`${baseURL}/login/emails?email=${email}`);
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
                    <label className="form-label" htmlFor="email" >Email</label>
                    <input className="form-control" placeholder="email" type="email" id="email" name="email" value={email} onChange={handleEmailChange} />
                </div>
                <PasswordWrapper>
                    <label className="form-label" htmlFor="password" >Password</label>
                    <input className="form-control" placeholder="password" type={passwordVisible ? "text" : "password"} id="password" name="password" value={password} onChange={handlePasswordChange} />
                    {!passwordVisible && <StyledOpenEye onClick={togglePasswordVisible} />}
                    {passwordVisible && <StyledClosedEye onClick={togglePasswordVisible} />}
                </PasswordWrapper> 
                {showVerifyPassword ? 
                    <PasswordWrapper>
                        <label className="form-label" htmlFor="verifyPassword" >Verify Password</label>
                        <input className="form-control" placeholder="verify password" type={passwordVisible ? "text" : "password"} id="verifyPassword" name="verifyPassword" value={verifyPassword} onChange={handleVerifyPasswordChange} />
                        {!passwordVisible && <StyledOpenEye onClick={togglePasswordVisible} />}
                        {passwordVisible && <StyledClosedEye onClick={togglePasswordVisible} />}
                    </PasswordWrapper> 
                    :
                    null
                }
                {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
                <ButtonContainer>
                    <button className="btn btn-primary" type="submit">Submit</button>
                </ButtonContainer>
                <p>Already have an account? <NavigationSpan onClick={goToLogin}>Login</NavigationSpan></p>
            </FormWrapper>
        </div>
    )
}

export default RegisterCredentialsForm;