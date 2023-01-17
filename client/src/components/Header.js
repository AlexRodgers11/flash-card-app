import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout, markNotificationsAsRead } from '../reducers/loginSlice';
import Message from './Message';
import MessageList from './MessageList';
import Modal from './Modal';
import NotificationList from './NotificationList';
import { HiOutlineUserCircle } from "react-icons/hi";
import { IoMailSharp, IoNotificationsSharp } from "react-icons/io5";
import styled from "styled-components";
import Logo from './Logo';

function Header() {
    const [modalContent, setModalContent] = useState('');
    const [messageId, setMessageId]  = useState('');
    const dispatch = useDispatch();
    const username = useSelector((state) => state.login.login.username);
    const userId = useSelector((state) => state.login.userId);
    const profilePic = useSelector((state) => state.login.photo);
    const notifications = useSelector((state) => state.login.notifications);
    const messages = useSelector((state) => state.login.messages.received);
    
        
    const expandMessage = (id) => {
        setModalContent('message');
        setMessageId(id);
    }

    const closeMessage = () => {
        setModalContent('inbox');
        setMessageId('');
    }

    const handleHideModal = () => {
        if(modalContent === "notifications") {
            dispatch(markNotificationsAsRead({userId}));
        }
        setModalContent('');
        setMessageId('');
    }
    
    const handleSetModalContent = (type, id) => {
        setModalContent(type);
        setMessageId(id);
    }

    const handleButtonClick = (evt) => {
        setModalContent(evt.currentTarget.dataset.source);
    }

    const handleLogout = () => {
        dispatch(logout());
    }

    
    
    return (
        <nav className="navbar navbar-collapse fixed-top navbar-light bg-light" style={{height: "4.5rem", minWidth: "300px", padding: 0}}>
            <div className="container-fluid" style={{height: "100%"}}>
                <div style={{display: "flex", alignItems: "center", height: "100%"}}>
                    <div className="navbar-brand">
                        <Link to={userId ? "/dashboard" : "/"}>
                            <Logo />
                        </Link>
                    </div>
                    {/* Clicking the anchor tag resets state */}
                    {/* <a className="navbar-brand" href={username ? "/dashboard" : "/"}>Logo</a> */}
                    <form className="d-none d-sm-flex">
                        <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                        <button className="btn btn-outline-success" type="submit">Search</button>
                    </form>
                </div>
                <div style={{display: "flex", alignItems: "center"}}>
                    {username && 
                        <div data-source="inbox" onClick={handleButtonClick} style={{position: "relative", left: "1.5rem"}}>
                            <IoMailSharp size="2.25em" style={{cursor: "pointer"}} />
                            <div style={{visibility: messages.filter(message => message.read.includes(userId) === false).length > 0 ? "visible" : "hidden", display:"inline-flex", position: "relative", right: ".5rem", bottom: ".65rem", alignItems: "center", justifyContent: "center", backgroundColor:"red", color: "white", border: "1px solid black", borderRadius: "50%", width: "1.25rem", height: "1.25rem", fontSize:".75em", fontWeight: "700"}}>{messages.filter(message => message.read.includes(userId) === false).length >= 10 ? "9+": messages.filter(message => message.read.includes(userId) === false).length}</div>
                        </div>}
                    {username && 
                        <div data-source="notifications" onClick={handleButtonClick} style={{position: "relative", left: "1rem"}}>
                            <IoNotificationsSharp size="2.25em" style={{cursor: "pointer"}} />
                            <div style={{visibility: notifications.filter(notification => notification.read === false).length > 0 ? "visible" : "hidden", display:"inline-flex", position: "relative", right: ".85rem", bottom: ".65rem", alignItems: "center", justifyContent: "center", backgroundColor:"red", color: "white", border: "1px solid black", borderRadius: "50%", width: "1.25rem", height: "1.25rem", fontSize:".75em", fontWeight: "700"}}>{notifications.filter(notification => notification.read === false).length >= 10 ? "9+": notifications.filter(notification => notification.read === false).length}</div>
                        </div>}
                    <li className="nav-item dropdown">
                        <div tabIndex={0} className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {profilePic ? <img alt={username} src={profilePic} style={{border: "2px solid black", borderRadius: "50%", height: "3em", width: "3em"}}/> : <HiOutlineUserCircle color="black" size="3em" />}
                        </div>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                            <li><a className="dropdown-item" onClick={username ? handleLogout : null} href={username ? "/" : "/login"}>{username ? "Log out" : "Login"}</a></li>
                            {!username && <li><a className="dropdown-item" href="register/credentials">Sign Up</a></li>}
                            <li><hr className="dropdown-divider" /></li>
                            <li><a className="dropdown-item" href="#">Something else here</a></li>
                        </ul>
                    </li>
                </div>
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
        </nav>
  )
}

export default Header