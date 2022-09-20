import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { NavLink } from 'react-router-dom';
import useToggle from '../hooks/useToggle';
import { logout } from '../reducers/loginSlice';
import Message from './Message';
import MessageList from './MessageList';
import Modal from './Modal';

function Header() {
    const [showModal, toggleShowModal] = useToggle(false);
    const [modalContent, setModalContent] = useState('inbox');
    const [messageId, setMessageId]  = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const username = useSelector((state) => state.login.username);
    
    const expandMessage = (id) => {
        setModalContent('message');
        setMessageId(id);
    }
    
    const handleClick = evt => {
        navigate(`/${evt.target.value}`);
    }

    const handleHideModal = () => {
        toggleShowModal();
        setModalContent('inbox');
        setMessageId('');
    }
    
    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    }
    
    const handleSetModalContent = (type, id) => {
        setModalContent(type);
        setMessageId(id);
    }


    return (
        <div style={{display: "flex", justifyContent: "space-between", padding: ".5em 2em"}}>            
            <div>
                {username ? 
                    <>
                        <strong>{username}</strong>
                        <button>N</button>
                        <button onClick={toggleShowModal}>M</button>
                    </>
                    : 
                    null
                }
            </div>
            <div>
                {!username ? 
                    <>
                        <button value="login" onClick={handleClick}>Login</button>
                        <button value="register/signup" onClick={handleClick}>Sign Up</button>
                    </>
                    :
                    <>
                        <NavLink to="/dashboard">Home</NavLink>
                        <NavLink to="/dashboard">Practice</NavLink>
                        <NavLink to="/">Explore</NavLink>
                        <button value="logout" onClick={handleLogout}>Logout</button>
                    </>
                }
                
            </div>            
            {!showModal ?
                null
                :
                <Modal hideModal={handleHideModal}>
                    {modalContent === 'inbox' ?
                        <MessageList expandMessage={expandMessage} hideModal={handleHideModal} setModalContent={handleSetModalContent}/>
                        :
                        modalContent === 'deck' ? 
                            <p>Deck Info will go here</p>
                            :
                            <div><Message fullView={true} hideModal={handleHideModal} messageId={messageId}/></div>
                    }
                </Modal>
            }
        </div>
  )
}

export default Header