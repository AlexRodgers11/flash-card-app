import { client } from '../utils';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import DeckList from './DeckList';
import styled from 'styled-components';
import { HiOutlineUserCircle } from "react-icons/hi";
import { RiMailSendFill } from "react-icons/ri";
import useToggle from '../hooks/useToggle';
import Modal from './Modal';
import useFormInput from '../hooks/useFormInput';
import { useDispatch, useSelector } from 'react-redux';
import { sendDirectMessage } from '../reducers/communicationsSlice';

const UserWrapper = styled.div`
    background-color: #FFD549;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: calc(100vh - 5.5rem);
`;

const ProfilePic = styled.img`
    border: 2px solid black; 
    border-radius: 50%;
    height: 20rem;
    width: 20rem;
    margin-right: 2rem;
    @media (max-width: 915px) {
        height: 15rem;
        width: 15rem;
        margin-right: 1rem;
    }
    @media (max-width: 795px) {
        height: 10rem;
        width: 10rem;
    }
    @media (max-width: 680px) {
        margin-right: 0;
        margin-bottom: 1rem;
    }    
`;

const StyledRiMailSendFill = styled(RiMailSendFill).attrs({
    role: "button",
})`
    position: relative;
    top: 1.75rem;
    right: 2rem;
    height: 3.5rem;
    width: 3.5rem;
    color: black;
    padding: .25rem;
    border: 3px solid black;
    border-radius: 15%;
    align-self: flex-end;
    &:hover {
        background-color: white
    }
`;

const StyledHiOutlineUserCircle = styled(HiOutlineUserCircle)`
    color: black;
    height: 20rem;
    width: 20rem;
    margin-right: 2rem;
    @media (max-width: 915px) {
        height: 15rem;
        width: 15rem;
        margin-right: 1rem;
    }
    @media (max-width: 795px) {
        height: 10rem;
        width: 10rem;
    }
    @media (max-width: 680px) {
        margin-right: 0;
        margin-bottom: 1rem;
    }    
`;

const InfoContainer = styled.div`
    display: flex;
    align-items: flex-end;
    align-items: center;
    height: 20rem;
    margin: 2rem 0;
    @media (max-width: 915px) {
        height: 15rem;
    }
    @media (max-width: 795px) {
        height: 10rem;
    }
    @media (max-width: 680px) {
        flex-direction: column;
        height: unset;
    }
`;

const InfoBlock = styled.div`
    text-align: left;
    background-color: white;
    width: 35rem;
    @media (max-width: 915px) {
        width: 25rem;
    }
    @media (max-width: 795px) {
        width: 20rem;
    }
    @media (max-width: 375px) {
        width: 15rem;
    }
    border: 2px solid black;
    & p {
        margin: 0;
        padding: 1rem;
        font-size: 1.15rem;
        @media (max-width: 915px) {
            font-size: 1rem;
            padding: .8rem;
        }
        @media (max-width: 795px) {
            font-size: .9rem;
            padding: .6rem;
        }
        @media (max-width: 375px) {
            font-size: .75rem;
            padding: .4rem;
        }
    }
        
    & hr {
        margin: 0;
        height: 1px;
        opacity: 1;
    }

    & .label  {
        font-weight: 700;
    }
`;

const BlockTextArea = styled.textarea`
    display: block;
    width: 100%;
    margin: 1rem 0;
`;

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function User() {
    const { userId } = useParams(); 
    const loggedInUserId = useSelector((state) => state.login.userId);
    const [userData, setUserData] = useState({});
    const [message, clearMessage, handleMessageChange, setMessage] = useFormInput("");
    const [showModal, toggleShowModal] = useToggle(false);
    const dispatch = useDispatch();

    const handleSubmit = (evt) => {
        evt.preventDefault();
        clearMessage();
        dispatch(sendDirectMessage({senderId: loggedInUserId, recipientId: userData._id, message: message}));
        toggleShowModal();
    }

    useEffect(() => {
        if(userData._id !== userId) {
            (async () => {
                try {
                    const userDataResponse = await client.get(`${baseURL}/users/${userId}?public_info=true`);
                    setUserData(userDataResponse.data);
                } catch (err) {
                    console.error(err);
                }
            })();
        }
    }, [userData._id, userId]);

    if(userData._id !== userId) {
        return <UserWrapper></UserWrapper>
    }
    return (
        <UserWrapper>
            {userData.allowDirectMessages && <StyledRiMailSendFill onClick={toggleShowModal}/>}
            <InfoContainer>
                {userData.photo && <ProfilePic alt="Profile" src={userData.photo} />}
                {!userData.photo && <StyledHiOutlineUserCircle />}
                <InfoBlock>
                    <p><span className="label">Username:</span> {userData.login.username}</p>
                    <hr />
                    <p><span className="label">Name:</span> {userData.name ? `${userData.name.first} ${userData.name.last}` : <em>Private</em>}</p>
                    <hr />
                    <p><span className="label">Email:</span> {userData.login?.email || <em>Private</em>}</p>
                </InfoBlock>
            </InfoContainer>
            {/* <InfoContainer>
                {userData.photo && <ProfilePic alt="Profile" src={userData.photo} />}
                {!userData.photo && <StyledHiOutlineUserCircle />}
                <InfoBlock>
                    <p><span className="label">Username:</span> {userData.login.username}</p>
                    
                    {userData.name && <><hr /> <p><span className="label">Name:</span> {userData.name.first} {userData.name.last}</p></>}
                    {userData.login?.email && <><hr /><p><span className="label">Email:</span> {userData.login.email}</p></>}
                </InfoBlock>
            </InfoContainer> */}
            <DeckList listType="user" listId={userId} />
            {showModal && 
                <Modal hideModal={toggleShowModal}>
                    <form onSubmit={handleSubmit}>
                        <BlockTextArea value={message} onChange={handleMessageChange} required cols="35" rows="10" autoComplete="off" autoFocus minLength={2} maxLength={3000} spellCheck={true} placeholder={`Type your message to ${userData.name ? `${userData.name.first} ${userData.name.last}` : userData.login.username} here`}/>
                        <button className="btn btn-primary btn-sm" type="submit">Send</button>
                        <button className="btn btn-danger btn-sm" onClick={toggleShowModal}>Cancel</button>
                    </form>
                </Modal>
            }
        </UserWrapper>
    );
    
}

export default User;