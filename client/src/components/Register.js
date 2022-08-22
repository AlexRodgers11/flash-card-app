import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { register } from '../reducers/loginSlice';

function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [username, clearUsername, setUsername] = useFormInput('');
    const [password, clearPassword, setPassword] = useFormInput('');
    const [showVerifyPassword, setShowVerifyPassword] = useState(false);
    const [verifyPassword, clearVerifyPassword, setVerifyPassword] = useFormInput('');

    const handleSubmit = evt => {
        evt.preventDefault();
        if(password === verifyPassword) {
            console.log("about to dispatch register action");
            dispatch(register({username, password}));
            clearUsername();
        } else {
            
            alert("Passwords do not match");
        }
        clearPassword();
        clearVerifyPassword();
        
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
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" value={username} onChange={setUsername} />
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
            </form>
        </div>
    )
}

export default Register