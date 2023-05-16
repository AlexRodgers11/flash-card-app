import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router'
import { fetchLoggedInUserData, login } from '../reducers/loginSlice';
import { fetchCommunications } from '../reducers/communicationsSlice';
import styled from 'styled-components';
import useToggle from '../hooks/useToggle';
import { NavigationSpan } from './StyledComponents/NavigationSpan';
import { ErrorMessage } from './StyledComponents/ErrorMessage';
import { PasswordWrapper, StyledClosedEye, StyledOpenEye } from './StyledComponents/Password';

const FormWrapper = styled.form`
    & input {
        width: 100%;
    }
`;

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, togglePasswordVisible] = useToggle(false);
    const [errorMessage, setErrorMessage] = useState();
    const userId = useSelector((state) => state.login.userId);
    const accountSetupStage = useSelector((state) => state.login.accountSetupStage);

    const handleUserNameOrEmailChange = (evt) => {
        setUsernameOrEmail(evt.target.value);
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

    const handleSubmit = evt => {
        evt.preventDefault();
        localStorage.removeItem("token");
        
        dispatch(login({usernameOrEmail, password}))
            .then(action => {
                if(!action?.payload?.token === "Unauthorized") {
                    setErrorMessage("Either your username or password are incorrect");
                } else {
                    localStorage.setItem("token", action.payload.token);
                }
                setPassword("");
                setUsernameOrEmail("");
            });   
    }

    const goToSignUpPage = () => {
        navigate("/register/credentials");
    }

    const goToPasswordReset = () => {
        navigate("/reset-password");
    }

    useEffect(() => {
        if(userId) {
            dispatch(fetchLoggedInUserData(userId));
            dispatch(fetchCommunications());
            if(accountSetupStage === "complete") {
                navigate("/dashboard");
            }
        }
    }, [accountSetupStage, userId, dispatch, navigate]);

    return (
        <div>
            <FormWrapper onSubmit={handleSubmit}>
                <div>
                    <input placeholder="username or email" type="text" id="usernameOrEmail" name="usernameOrEmail" value={usernameOrEmail} onChange={handleUserNameOrEmailChange} />
                </div>
                <PasswordWrapper>
                    <input placeholder="password" type={passwordVisible ? "text" : "password"} id="password" name="password" value={password} onChange={handlePasswordChange} />
                    {!passwordVisible && <StyledOpenEye onClick={togglePasswordVisible} />}
                    {passwordVisible && <StyledClosedEye onClick={togglePasswordVisible} />}
                </PasswordWrapper> 
                {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
                <p>Forgot your password? <NavigationSpan onClick={goToPasswordReset}>Reset Password</NavigationSpan></p>
                <p>Don't have an account? <NavigationSpan onClick={goToSignUpPage}>Sign up now!</NavigationSpan></p>
            </FormWrapper>
        </div>
    )
}

export default Login