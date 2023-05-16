import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import styled from 'styled-components';
import useToggle from '../hooks/useToggle';
import { ErrorMessage } from './StyledComponents/ErrorMessage';
import { PasswordWrapper, StyledClosedEye, StyledOpenEye } from './StyledComponents/Password';
import { NavigationSpan } from './StyledComponents/NavigationSpan';

const FormWrapper = styled.form`
    text-align: left;
    & input {
        // width: 100%;
        min-width: 325px;
        margin-bottom: .5rem;
    }
    & .form-label {
        font-weight: 500;
        margin-bottom: 1px;
    }
`;

const ButtonContainer = styled.div`
    text-align: center;
    margin-top: 1.5rem;
`;


const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function PasswordReset() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState("");
    const [resetCode, clearResetCode, handleResetCodeChange, setResetCode] = useFormInput();
    const [resetCodeStatus, setResetCodeStatus] = useState("");
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

    const getResetCode = async (evt) => {
        evt.preventDefault();
        try {
            const response = await axios.patch(`${baseURL}/login/reset-password`, {email: email});
            if(response.data.codeSent) {
                setResetCodeStatus("email-sent");
            }
        } catch (err) {
            setErrorMessage(err.message);
        }
        
    }

    const verifyCode = async (evt) => {
        evt.preventDefault();
        try {
            const response = await axios.patch(`${baseURL}/login/reset-password`, {email: email, resetCode: resetCode});
            if(response.data.userId) {
                setUserId(response.data?.userId);
                setResetCodeStatus("verified")
            } else {
                console.log({response});
            }
        } catch (err) {
            console.log({err});
            console.error(err.message);
        }
    }

    const saveNewPassord = async(evt) => {
        evt.preventDefault();
        try {
            const response = await axios.patch(`${baseURL}/login/reset-password`, {resetCode: resetCode, password: password, userId: userId, email: email});
            if(response.data.reset) {
                setResetCodeStatus("reset");
            }
        } catch (err) {
            console.error(err);
        }
    }

    const goToLogin = () => {
        navigate("/login");
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
            {/* <FormWrapper onSubmit={handleSubmit}> */}
            
                {!resetCodeStatus && 
                    <FormWrapper onSubmit={getResetCode}>
                        <div>
                            <label className="form-label" htmlFor="email" >Email</label>
                            <input className="form-control" placeholder="email" type="email" id="email" name="email" value={email} onChange={handleEmailChange} />
                        </div>
                        <ButtonContainer>
                            <button className="btn btn-danger" type="submit" onClick={getResetCode}>Reset Password</button>
                        </ButtonContainer>
                    </FormWrapper>
                }
                {resetCodeStatus === "email-sent" && 
                    <FormWrapper onSubmit={verifyCode}>
                        <div>
                            <label className="form-label" htmlFor="email" >Verification Code</label>
                            <input className="form-control" placeholder="Enter the code that was emailed to you" type="text" id="reset-code" name="reset-code" value={resetCode} onChange={handleResetCodeChange} />
                        </div>
                        <ButtonContainer>
                            <button className="btn btn-primary" type="submit">Confirm</button>
                            <button className="btn btn-danger" onClick={getResetCode}>Resend Code</button>
                        </ButtonContainer>
                    </FormWrapper>
                }
                {resetCodeStatus === "verified" &&
                    <FormWrapper onSubmit={saveNewPassord}>    
                        <PasswordWrapper>
                            <label className="form-label" htmlFor="password" >Password</label>
                            <input className="form-control" placeholder="password" type={passwordVisible ? "text" : "password"} id="password" name="password" value={password} onChange={handlePasswordChange} />
                            {!passwordVisible && <StyledOpenEye onClick={togglePasswordVisible} />}
                            {passwordVisible && <StyledClosedEye onClick={togglePasswordVisible} />}
                        </PasswordWrapper> 
                        {showVerifyPassword && 
                            <PasswordWrapper>
                                <label className="form-label" htmlFor="verifyPassword" >Verify Password</label>
                                <input className="form-control" placeholder="verify password" type={passwordVisible ? "text" : "password"} id="verifyPassword" name="verifyPassword" value={verifyPassword} onChange={handleVerifyPasswordChange} />
                                {!passwordVisible && <StyledOpenEye onClick={togglePasswordVisible} />}
                                {passwordVisible && <StyledClosedEye onClick={togglePasswordVisible} />}
                            </PasswordWrapper> 
                        }
                        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
                        <ButtonContainer><button className="btn btn-primary" type="submit">Save</button></ButtonContainer>
                    </FormWrapper>
                }
                {resetCodeStatus === "reset" &&
                    <>
                    <p>Your password has been successfully reset</p>
                    <NavigationSpan onClick={goToLogin}>Return to login</NavigationSpan>
                    </>
                }
        </div>
    )
}

export default PasswordReset;