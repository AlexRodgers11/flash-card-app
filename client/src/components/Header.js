import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { dispatchWithExpiredTokenCatch } from "../utils";
import { resetSessionSetupFormData, setDeckIdInSetup } from "../reducers/practiceSessionSlice";

const HeaderWrapper = styled.nav`
    height: 5.5rem;
    min-width: 350px;
    padding: 0;
    // background-color: #152556 !important;
    background-color: #051647 !important;
    & #navbarDropdown.nav-link.dropdown-toggle::after {
        color: white;
    }
    & #navbarDropdown.nav-link.dropdown-toggle.show::after {
        color: #03ffff;
    }
`;

const DropDownItem = styled.p`
    cursor: pointer;
`

const StyledIoNotificationsSharp = styled(IoNotificationsSharp)`
    height: 2.25rem;
    width: 2.25rem;
    cursor: pointer;
    color: white;
    &:hover {
        color: #03ffff
    }
`;

const StyledIoMailSharp = styled(IoMailSharp)`
    height: 2.25rem;
    width: 2.25rem;
    cursor: pointer;
    color: white;
    &:hover {
        color: #03ffff
    }
`;

const StyledHiOutlineUserCircle = styled(HiOutlineUserCircle)`
    color: white; 
    height: 3.5rem;
    width: 3.5rem;
    &:hover {
        color: #03ffff;
    }
`;

const ProfilePic = styled.img`
    border: 1px solid transparent; 
    border-radius: 50%;
    height: 4rem;
    width: 4rem;
    &:hover {
        border: 2px solid #03ffff;
    }
`;

const StyledButton = styled.button`
	padding: .25rem .5rem;
	margin: 0 .5rem 1rem 0;
	@media (max-width: 475px) {
		padding: .2rem .4rem;
		margin: 0 .4rem .8rem 0;
	}
	@media (max-width: 375px) {
		padding: .15rem .3rem;
		margin: 0 .25rem .5rem 0rem;
		font-size: .75rem;
	}
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
    const location = useLocation();

    useEffect(() => {
        console.log("profilePic changed");
        console.log({profilePic});
    }, [profilePic]);
        
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
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        localStorage.removeItem("token");
        localStorage.removeItem("persist:login");
        localStorage.removeItem("persist:communications");
        localStorage.removeItem("persist:practiceSession");
        window.location.reload();
        handleHideModal();
    }

    const handleGoToDashboard = () => {
        dispatch(setDeckIdInSetup(""));
        dispatch(resetSessionSetupFormData());
    }

    const communicationsFetchInterval = useRef();

    useEffect(() => {
            if(!communicationsFetchInterval.current && (accountSetupStage === "complete" && token)) {
                // communicationsFetchInterval.current = setInterval(() => dispatchWithExpiredTokenCatch(dispatch, logout, fetchCommunications), 10000);
                communicationsFetchInterval.current = setInterval(() => dispatchWithExpiredTokenCatch(dispatch, logout, fetchCommunications), 1000000);

                return () => clearInterval(communicationsFetchInterval.current);
            }
    }, [dispatch, accountSetupStage, userId, token]);
    
    return (
        <HeaderWrapper className="navbar navbar-collapse fixed-top navbar-light bg-light">
            <div className="container-fluid" style={{height: "100%"}}>
                <div style={{display: "flex", alignItems: "center", height: "100%"}}>
                    <div className="navbar-brand">
                        <Link onClick={handleGoToDashboard} to={userId ? "/dashboard" : "/"}>
                            <Logo />
                        </Link>
                    </div>
                </div>
                <div style={{display: "flex", alignItems: "center"}}>
                    {name?.first && 
                        <div data-source="inbox" onClick={handleButtonClick} className="d-none d-sm-block" style={{position: "relative", left: "1.5rem"}}>
                        {/* <div data-source="inbox" onClick={handleButtonClick} style={{position: "relative", left: "1.5rem"}}> */}
                            <StyledIoMailSharp role="button"/>
                            <div style={{visibility: messages.filter(message => message.read.includes(userId) === false).length > 0 ? "visible" : "hidden", display:"inline-flex", position: "relative", right: ".5rem", bottom: ".65rem", alignItems: "center", justifyContent: "center", backgroundColor:"red", color: "white", border: "1px solid black", borderRadius: "50%", width: "1.25rem", height: "1.25rem", fontSize:".75em", fontWeight: "700"}}>{messages.filter(message => message.read.includes(userId) === false).length >= 10 ? "9+": messages.filter(message => message.read.includes(userId) === false).length}</div>
                        </div>}
                    {accountSetupStage === "complete" && 
                        <div data-source="notifications" onClick={handleButtonClick} className="d-none d-sm-block" style={{position: "relative", left: "1rem"}}>
                            <StyledIoNotificationsSharp role="button" />
                            <div style={{visibility: notifications.filter(notification => notification.read === false).length > 0 ? "visible" : "hidden", display:"inline-flex", position: "relative", right: ".85rem", bottom: ".65rem", alignItems: "center", justifyContent: "center", backgroundColor:"red", color: "white", border: "1px solid black", borderRadius: "50%", width: "1.25rem", height: "1.25rem", fontSize:".75em", fontWeight: "700"}}>{notifications.filter(notification => notification.read === false).length >= 10 ? "9+": notifications.filter(notification => notification.read === false).length}</div>
                        </div>}
                    <li className="nav-item dropdown">
                        <div tabIndex={0} className="nav-link dropdown-toggle" href="#" style={{paddingRight: "0"}} id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            {profilePic && (!location.pathname.includes("identification") && !location.pathname.includes("profile-pic-crop")) ? <ProfilePic alt={username || `${name.first} ${name.last}`} src={profilePic} /> : <StyledHiOutlineUserCircle />}
                        </div>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                            <li><a className="dropdown-item" onClick={userId ? handleLogout : handleLogin} href="/">{name?.first ? "Log out" : "Login"}</a></li>
                            {!userId && <li><a className="dropdown-item" href="register/credentials">Sign Up</a></li>}
                            {userId && <li><hr className="dropdown-divider d-block d-sm-none " /></li>}
                            {userId && <li><DropDownItem data-source="inbox" onClick={handleButtonClick} className="d-block d-sm-none dropdown-item">Inbox</DropDownItem></li>}
                            {userId && <li><DropDownItem data-source="inbox" onClick={handleButtonClick} className="d-block d-sm-none dropdown-item">Notifications</DropDownItem></li>}
                        </ul>
                    </li>
                </div>
            </div>
            {modalContent === "inbox" &&
                <Modal hideModal={handleHideModal}>
                    <MessageList expandMessage={expandMessage} hideModal={handleHideModal} setModalContent={handleSetModalContent}/>
                </Modal>
            }
            {modalContent === "notifications" &&
                <Modal hideModal={handleHideModal}>
                    <NotificationList hideModal={handleHideModal} />
                </Modal>
            }
            {modalContent === "message" &&
                <Modal hideModal={handleHideModal}>
                    <>
                        <StyledButton onClick={closeMessage}>Back to Inbox</StyledButton>
                        <div><Message fullView={true} hideModal={handleHideModal} messageId={messageId} messageType={messageType} direction={messageDirection}/></div>
                    </>
                </Modal>
            }
        </HeaderWrapper>
  )
}

export default Header