import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { signUp } from '../reducers/loginSlice';

function RegisterCredentialsForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, clearEmail, setEmail] = useFormInput('');
    const [password, clearPassword, setPassword] = useFormInput('');
    const [showVerifyPassword, setShowVerifyPassword] = useState(false);
    const [verifyPassword, clearVerifyPassword, setVerifyPassword] = useFormInput('');
    const userId = useSelector((state) => state.login.userId);

    const handleSubmit = evt => {
        evt.preventDefault();
        if(password === verifyPassword) {
            console.log("about to dispatch register action");
            dispatch(signUp({email, password}))
            .then(() => {navigate("/register/identification")});
            clearEmail();
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
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" value={email} onChange={setEmail} />
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

export default RegisterCredentialsForm;