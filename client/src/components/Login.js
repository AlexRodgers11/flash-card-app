import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router'
import useFormInput from '../hooks/useFormInput';
import { fetchLoggedInUserData, login } from '../reducers/loginSlice';
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styled from 'styled-components';
import useToggle from '../hooks/useToggle';

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
            .then(action => {
                console.log({payload: action.payload});
                if(action.payload.userId) {
                    navigate("/dashboard");
                }
                clearPassword();
                clearUsernameOrEmail();
            });
    }

    useEffect(() => {
        if(userId) {
            dispatch(fetchLoggedInUserData(userId));
        }
    }, [userId, dispatch]);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <input placeholder="username or email" type="text" id="usernameOrEmail" name="usernameOrEmail" value={usernameOrEmail} onChange={setUsernameOrEmail} />
                </div>
                <PasswordWrapper>
                    <input placeholder="password" type={passwordVisible ? "text" : "password"} id="password" name="password" value={password} onChange={setPassword} />
                    {!passwordVisible && <StyledOpenEye onClick={togglePasswordVisible} />}
                    {passwordVisible && <StyledClosedEye onClick={togglePasswordVisible} />}
                </PasswordWrapper> 
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default Login