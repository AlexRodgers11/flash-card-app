import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const baseURL = 'http://localhost:8000';

const GroupMemberOptionWrapper = styled.div`
    display: inline-flex;
    align-items: center;
    width: 250px;
    border: 1px solid black;
    margin-bottom: .25rem;
    padding: .15rem;
    cursor: pointer;
    @media (max-width: 400px) {
        width: 200px;
        font-size: .75rem;
    }
`;

const ImageContainer = styled.div`
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    overflow: hidden;
    margin-top: .5rem;
    margin-right: .5rem;
    margin-block-start: 0;
	margin-block-end: 0;
`;

const StyledImage  = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const NameWrapper = styled.span`
    font-weight: 600;
`

function GroupMemberOption(props) {
    const [memberData, setMemberData] = useState();

    useEffect(() => {
        if(!memberData?.firstName) {
            axios.get(`${baseURL}/users/${props.memberId}/identification`)
            .then((response) => {
                setMemberData(response.data);
            })
            .catch(err => {
                console.error(err);
            });
        }
    });

    return (
        <GroupMemberOptionWrapper role="button">
            {memberData && 
            <>
                <ImageContainer>
                    <StyledImage alt={`${memberData.firstName}-${memberData.lastName}`} src={memberData.photo}/>
                </ImageContainer>
                <NameWrapper>{memberData.firstName} {memberData.lastName}</NameWrapper>
            </>
            }
        </GroupMemberOptionWrapper>
    )
}  

export default GroupMemberOption;