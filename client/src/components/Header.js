import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchCommunications, markNotificationsAsRead } from "../reducers/communicationsSlice";
import { logout } from "../reducers/loginSlice";
import Message from "./Message";
import MessageList from "./MessageList";
import Modal from "./Modal";
import NotificationList from "./NotificationList";
import { HiOutlineUserCircle } from "react-icons/hi";
import { IoMailSharp, IoNotificationsSharp } from "react-icons/io5";
import styled from "styled-components";
import Logo from "./Logo";

const HeaderWrapper = styled.nav`
    height: 5.5rem;
    min-width: 300px;
    padding: 0;
    // background-color: #152556 !important;
    background-color: #051647 !important;
`;

const DropDownItem = styled.p`
    cursor: pointer;
`

const StyledIoNotificationsSharp = styled(IoNotificationsSharp)`
    height: 2.25rem;
    width: 2.25rem;
    cursor: pointer;
    color: white;
`;

const StyledIoMailSharp = styled(IoMailSharp)`
    height: 2.25rem;
    width: 2.25rem;
    cursor: pointer;
    color: white;
`;

const StyledHiOutlineUserCircle = styled(HiOutlineUserCircle)`
    color: white; 
    height: 3.5rem;
    width: 3.5rem;
`;

const ProfilePic = styled.img`
    border: 1px solid transparent; 
    border-radius: 50%;
    height: 4rem;
    width: 4rem
`;

function Header() {
    const [modalContent, setModalContent] = useState();
    const [messageId, setMessageId]  = useState();
    const [messageType, setMessageType] = useState();
    const [messageDirection, setMessageDirection] = useState();
    const username = useSelector((state) => state.login.login.username);
    const userId = useSelector((state) => state.login.userId);
    const name = useSelector((state) => state.login.name);
    const token = useSelector((state) => state.login.token);
    const accountSetupStage = useSelector((state) => state.login.accountSetupStage);
    const profilePic = useSelector((state) => state.login.photo);
    const notifications = useSelector((state) => state.communications.notifications);
    const messages = useSelector((state) => state.communications.messages.received);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
        
    const expandMessage = (id, type, direction) => {
        setModalContent("message");
        setMessageId(id);
        setMessageType(type);
        setMessageDirection(direction);
    }

    const closeMessage = () => {
        setModalContent("inbox");
        setMessageId("");
    }

    const handleHideModal = () => {
        if(modalContent === "notifications") {
            dispatch(markNotificationsAsRead());
        }
        setModalContent("");
        setMessageId("");
    }
    
    const handleSetModalContent = (type, id) => {
        setModalContent(type);
        setMessageId(id);
    }

    const handleButtonClick = (evt) => {
        setModalContent(evt.currentTarget.dataset.source);
    }

    const handleLogin = (evt) => {
        evt.preventDefault();
        navigate("/login");
    }

    const handleLogout = (evt) => {
        evt.preventDefault();
        navigate("/");
        dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("persist:login");
        window.location.reload();
        handleHideModal();
    }

    const firstRender = useRef(true);

    useEffect(() => {
        if(!firstRender.current) {
            if(accountSetupStage === "complete" && token) {
                const communicationsFetchInterval = setInterval(() => dispatch(fetchCommunications()), 10000);
                return () => clearInterval(communicationsFetchInterval);
            }
        } else {
            firstRender.current = false;
        }

    }, [dispatch, accountSetupStage, userId, token]);
    
    return (
        <HeaderWrapper className="navbar navbar-collapse fixed-top navbar-light bg-light">
            <div className="container-fluid" style={{height: "100%"}}>
                <div style={{display: "flex", alignItems: "center", height: "100%"}}>
                    <div className="navbar-brand">
                        <Link to={userId ? "/dashboard" : "/"}>
                            <Logo />
                        </Link>
                    </div>
                    {/* Clicking the anchor tag resets state */}
                    {/* <a className="navbar-brand" href={username ? "/dashboard" : "/"}>Logo</a> */}
                    {/* <form className="d-none d-md-flex">
                        <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                        <button className="btn btn-outline-success" type="submit">Search</button>
                    </form> */}
                </div>
                <div style={{display: "flex", alignItems: "center"}}>
                    {name?.first && 
                        <div data-source="inbox" onClick={handleButtonClick} className="d-none d-sm-block" style={{position: "relative", left: "1.5rem"}}>
                        {/* <div data-source="inbox" onClick={handleButtonClick} style={{position: "relative", left: "1.5rem"}}> */}
                            <StyledIoMailSharp />
                            <div style={{visibility: messages.filter(message => message.read.includes(userId) === false).length > 0 ? "visible" : "hidden", display:"inline-flex", position: "relative", right: ".5rem", bottom: ".65rem", alignItems: "center", justifyContent: "center", backgroundColor:"red", color: "white", border: "1px solid black", borderRadius: "50%", width: "1.25rem", height: "1.25rem", fontSize:".75em", fontWeight: "700"}}>{messages.filter(message => message.read.includes(userId) === false).length >= 10 ? "9+": messages.filter(message => message.read.includes(userId) === false).length}</div>
                        </div>}
                    {name.first && 
                        <div data-source="notifications" onClick={handleButtonClick} className="d-none d-sm-block" style={{position: "relative", left: "1rem"}}>
                            <StyledIoNotificationsSharp />
                            <div style={{visibility: notifications.filter(notification => notification.read === false).length > 0 ? "visible" : "hidden", display:"inline-flex", position: "relative", right: ".85rem", bottom: ".65rem", alignItems: "center", justifyContent: "center", backgroundColor:"red", color: "white", border: "1px solid black", borderRadius: "50%", width: "1.25rem", height: "1.25rem", fontSize:".75em", fontWeight: "700"}}>{notifications.filter(notification => notification.read === false).length >= 10 ? "9+": notifications.filter(notification => notification.read === false).length}</div>
                        </div>}
                    <li className="nav-item dropdown">
                        <div tabIndex={0} className="nav-link dropdown-toggle" href="#" style={{paddingRight: "0"}} id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {profilePic ? <ProfilePic alt={username || `${name.first} ${name.last}`} src={profilePic} /> : <StyledHiOutlineUserCircle />}
                        </div>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                            <li><a className="dropdown-item" onClick={name.first ? handleLogout : handleLogin} href="/">{name?.first ? "Log out" : "Login"}</a></li>
                            {!name.first && <li><a className="dropdown-item" href="register/credentials">Sign Up</a></li>}
                            {name.first && <li><hr className="dropdown-divider d-block d-sm-none " /></li>}
                            {name.first && <li><DropDownItem data-source="inbox" onClick={handleButtonClick} className="d-block d-sm-none dropdown-item">Inbox</DropDownItem></li>}
                            {name.first && <li><DropDownItem data-source="inbox" onClick={handleButtonClick} className="d-block d-sm-none dropdown-item">Notifications</DropDownItem></li>}
                        </ul>
                    </li>
                </div>
            </div>
            {!modalContent ?
                null
                :
                <Modal hideModal={handleHideModal}>
                    {modalContent === "inbox" ?
                        <MessageList expandMessage={expandMessage} hideModal={handleHideModal} setModalContent={handleSetModalContent}/>
                        :
                        modalContent === "deck" ? 
                            <p>Deck Info will go here</p>
                            :
                            modalContent === "notifications" ?
                                <div><NotificationList hideModal={handleHideModal} /></div>
                                :
                                <>
                                    <button onClick={closeMessage}>Back to Inbox</button>
                                    <div><Message fullView={true} hideModal={handleHideModal} messageId={messageId} messageType={messageType} direction={messageDirection}/></div>
                                </>
                    }
                </Modal>
            }
        </HeaderWrapper>
  )
}

export default Header