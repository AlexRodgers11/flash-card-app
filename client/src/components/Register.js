import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import useFormInput from '../hooks/useFormInput';

function Register() {
    const navigate = useNavigate();
    const [usernameOrEmail, setUsernameOrEmail] = useFormInput('');
    const [password, setPassword] = useFormInput('');
    const [showVerifyPassword, setShowVerifyPassword] = useState(false);
    const [verifyPassword, setVerifyPassword] = useFormInput('');

    const handleSubmit = evt => {
        evt.preventDefault();
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
                    <label htmlFor="usernameOrEmail">Username or email</label>
                    <input type="text" id="usernameOrEmail" name="usernameOrEmail" value={usernameOrEmail} onChange={setUsernameOrEmail} />
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
            </form>
        </div>
    )
}

export default Register