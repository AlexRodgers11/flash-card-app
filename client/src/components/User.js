import { client } from '../utils';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import DeckList from './DeckList';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { HiOutlineUserCircle } from "react-icons/hi";

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

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function User() {
    const { userId } = useParams(); 
    const [userData, setUserData] = useState({});

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
        </UserWrapper>
    );
    
}

export default User