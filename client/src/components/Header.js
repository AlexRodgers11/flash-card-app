import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { logout } from '../reducers/loginSlice';

function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const username = useSelector((state) => state.login.username);

    const handleClick = evt => {
        navigate(`/${evt.target.value}`);
    }

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    }


    return (
        <div style={{display: "flex", justifyContent: "space-between", padding: ".5em 2em"}}>
            <div><strong>{username ? username: null}</strong></div>
            {!username ? 
                <div>
                    <button value="login" onClick={handleClick}>Login</button>
                    <button value="register/signup" onClick={handleClick}>Sign Up</button>
                </div>
                :
                <div>
                    <button value="logout" onClick={handleLogout}>Logout</button>
                </div>
            }
            
        </div>
  )
}

export default Header