import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { NavLink } from 'react-router-dom';
import { logout } from '../reducers/loginSlice';
import Message from './Message';
import MessageList from './MessageList';
import Modal from './Modal';
import NotificationList from './NotificationList';

function Header() {
    const [modalContent, setModalContent] = useState('');
    const [messageId, setMessageId]  = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const username = useSelector((state) => state.login.login.username);
    const notifications = useSelector((state) => state.login.notifications);
    
    const expandMessage = (id) => {
        setModalContent('message');
        setMessageId(id);
    }

    const closeMessage = () => {
        setModalContent('inbox');
        setMessageId('');
    }
    
    const handleClick = evt => {
        navigate(`/${evt.target.value}`);
    }

    const handleHideModal = () => {
        setModalContent('');
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

    const handleButtonClick = (evt) => {
        setModalContent(evt.target.dataset.source);
    }
    
    return (
        <div style={{display: "flex", justifyContent: "space-between", padding: ".5em 2em"}}>            
            <div>
                {username ? 
                    <>
                        <strong>{username}</strong>
                        <button data-source="notifications" onClick={handleButtonClick}>N:{notifications.slice(0, 100).filter(notification => !notification.read).length}</button>
                        <button data-source="inbox" onClick={handleButtonClick}>M</button>
                    </>
                    : 
                    null
                }
            </div>
            <div>
                {!username ? 
                    <>
                        <button value="login" onClick={handleClick}>Login</button>
                        <button value="register/credentials" onClick={handleClick}>Sign Up</button>
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
            {!modalContent ?
                null
                :
                <Modal hideModal={handleHideModal}>
                    {modalContent === 'inbox' ?
                        <MessageList expandMessage={expandMessage} hideModal={handleHideModal} setModalContent={handleSetModalContent}/>
                        :
                        modalContent === 'deck' ? 
                            <p>Deck Info will go here</p>
                            :
                            modalContent === 'notifications' ?
                                <div><NotificationList hideModal={handleHideModal} /></div>
                                :
                                <>
                                    <button onClick={closeMessage}>Back to Inbox</button>
                                    <div><Message fullView={true} hideModal={handleHideModal} messageId={messageId}/></div>
                                </>
                    }
                </Modal>
            }
        </div>
  )
}

export default Header