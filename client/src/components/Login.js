import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router'
import useFormInput from '../hooks/useFormInput';
import { fetchLoggedInUserData, login } from '../reducers/loginSlice';
import { fetchCommunications } from '../reducers/communicationsSlice';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styled from 'styled-components';
import useToggle from '../hooks/useToggle';
import { NavigationSpan } from './StyledComponents/NavigationSpan';

const FormWrapper = styled.form`
    & input {
        width: 100%;
    }
`;

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



function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [usernameOrEmail, clearUsernameOrEmail, setUsernameOrEmail] = useFormInput('');
    const [password, clearPassword, setPassword] = useFormInput('');
    const [passwordVisible, togglePasswordVisible] = useToggle(false);
    const userId = useSelector((state) => state.login.userId);

    const handleSubmit = evt => {
        evt.preventDefault();
        dispatch(login({usernameOrEmail, password}))    
        clearPassword();
        clearUsernameOrEmail();
    }

    const goToSignUpPage = () => {
        navigate("/register/credentials")
    }

    useEffect(() => {
        if(userId) {
            dispatch(fetchLoggedInUserData(userId));
            dispatch(fetchCommunications({userId}));
            navigate("/dashboard");
        }
    }, [userId, dispatch, navigate]);

    return (
        <div>
            <FormWrapper onSubmit={handleSubmit}>
                <div>
                    <input placeholder="username or email" type="text" id="usernameOrEmail" name="usernameOrEmail" value={usernameOrEmail} onChange={setUsernameOrEmail} />
                </div>
                <PasswordWrapper>
                    <input placeholder="password" type={passwordVisible ? "text" : "password"} id="password" name="password" value={password} onChange={setPassword} />
                    {!passwordVisible && <StyledOpenEye onClick={togglePasswordVisible} />}
                    {passwordVisible && <StyledClosedEye onClick={togglePasswordVisible} />}
                </PasswordWrapper> 
                <button type="submit">Submit</button>
                <p>Don't have an account? <NavigationSpan onClick={goToSignUpPage}>Sign up now!</NavigationSpan></p>
            </FormWrapper>
        </div>
    )
}

export default Login