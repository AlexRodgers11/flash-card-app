import React from 'react'
import { useNavigate } from 'react-router'
import useFormInput from '../hooks/useFormInput';

function Login() {
    const navigate = useNavigate();
    const [usernameOrEmail, clearUsernameOrEmail, setUsernameOrEmail] = useFormInput('');
    const [password, clearPassword, setPassword] = useFormInput('');

    const handleSubmit = evt => {
        evt.preventDefault();
    }

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
            </form>
        </div>
    )
}

export default Login