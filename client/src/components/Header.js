import React from 'react';
import { useNavigate } from 'react-router';

function Header() {
    const navigate = useNavigate();

    const handleClick = evt => {
        navigate(`/${evt.target.value}`);
    }


    return (
    <div>
        <button value="login" onClick={handleClick}>Login</button>
        <button value="register/signup" onClick={handleClick}>Sign Up</button>
    </div>
  )
}

export default Header