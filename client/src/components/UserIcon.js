import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components';
import { client } from '../utils';

const UserIconWrapper = styled.div`
    position: relative;
    display: inline-block;
    // overflow: hidden;
    margin: 0 .1rem;
    &:hover .initials-overlay {
        opacity: 1;
    }
`;

const InitialsOverlay = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    opacity: 0;
    transition: .25s ease;
    background-color: #008CBA;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
`;

const StyledImage = styled.img`
    position: relative;
    top: 0;
    width: 100%;
    object-fit: cover;
    border-radius: 50%;
`;

function UserIcon(props) {
    const [userData, setUserData] = useState({});
    
    const baseURL = 'http://localhost:8000';

    useEffect(() => {
        client.get(`${baseURL}/users/${props.memberId}/tile`)
            .then((response) => setUserData(response.data));
    }, [props.memberId]);

    if(!userData.firstName) {
        return;
    }
    
    return (
        <UserIconWrapper style={{height: `${props.height}rem`, width: `${props.width}rem`}} className="ImageContainer">
            {userData.photo && 
                <StyledImage style={{height: `${props.height}rem`, width: `${props.width}rem`}} className="StyledImage" src={userData.photo} alt="profile-icon" />
            } 
            <InitialsOverlay style={{fontSize: `${props.width / 2}rem`}} className="initials-overlay">{`${userData.firstName[0]}.${userData.lastName[0]}.`}</InitialsOverlay>
        </UserIconWrapper>
    )
    // return (
    //     <UserIconWrapper style={{height: "90%", width: "90%"}} className="ImageContainer">
    //         {userData.photo && 
    //             <StyledImage className="StyledImage" src={userData.photo} alt="profile-icon" />
    //         } 
    //         <InitialsOverlay style={{fontSize: `${props.width / 2}rem`}} className="initials-overlay">{`${userData.firstName[0]}.${userData.lastName[0]}.`}</InitialsOverlay>
    //     </UserIconWrapper>
    // )
}


export default UserIcon

