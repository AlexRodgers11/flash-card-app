import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router'
import useFormInput from '../hooks/useFormInput';
import { fetchLoggedInUserData, login } from '../reducers/loginSlice';

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [usernameOrEmail, clearUsernameOrEmail, setUsernameOrEmail] = useFormInput('');
    const [password, clearPassword, setPassword] = useFormInput('');
    const userId = useSelector((state) => state.login.userId);
    const foundUser = useSelector((state) => state.login.username);

    const handleSubmit = evt => {
        evt.preventDefault();
        dispatch(login({usernameOrEmail, password}));
        clearPassword();
        clearUsernameOrEmail();
    }

    useEffect(() => {
        if(userId) {
            dispatch(fetchLoggedInUserData(userId));
        }
    }, [userId, dispatch]);

    useEffect(() => {
        if(foundUser) {
            navigate(`/dashboard`);
        }
    }, [foundUser, navigate]);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="usernameOrEmail">Username or email</label>
                    <input type="text" id="usernameOrEmail" name="usernameOrEmail" value={usernameOrEmail} onChange={setUsernameOrEmail} />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" value={password} onChange={setPassword} />
                </div> 
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default Login