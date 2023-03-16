import React from 'react'
import PropTypes from 'prop-types'
import UserTile from './UserTile'
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const GroupMemberListWrapper = styled.div`
    min-width: 350px;
    // min-height: calc(100vh - 4.5rem);
    min-height: 100%;
    width: 98%;
    display: grid;
    // place-items: center;
    margin-bottom: 3rem;
    border: ${(props) => props.extraStyling ? "2px solid black" : "none"};
    background-color: ${(props) => props.extraStyling ? "#e3e3e3" : "inherit"};

    grid-template-columns: repeat(1, 1fr);
    
    @media (min-width: 260px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 400px) {
        grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: 515px) {
        grid-template-columns: repeat(4, 1fr);
    }

    @media (min-width: 662px) {
        grid-template-columns: repeat(5, 1fr);
    }
    
    @media (min-width: 800px) {
        grid-template-columns: repeat(6, 1fr);
    }

    @media (min-width: 935px) {
        grid-template-columns: repeat(7, 1fr);
    }

    @media (min-width: 1050px) {
        grid-template-columns: repeat(8, 1fr);
    }

    @media (min-width: 1155px) {
        grid-template-columns: repeat(9, 1fr);
    }

    @media (min-width: 1275px) {
        grid-template-columns: repeat(10, 1fr);
    }

    @media (min-width: 1410px) {
        grid-template-columns: repeat(11, 1fr);
    }

    @media (min-width: 1525px) {
        grid-template-columns: repeat(12, 1fr);
    }
    
    @media (min-width: 1670px) {
        grid-template-columns: repeat(13, 1fr);
    }

    @media (min-width: 1785px) {
        grid-template-columns: repeat(14, 1fr);
    }

    @media (min-width: 2000px) {
        grid-template-columns: repeat(15, 1fr);
    }

`;

function GroupMemberList(props) {
    const administrators = useSelector((state) => state.group.administrators);
    const groupMemberIds = useSelector((state) => state.group.memberIds);
    const userId = useSelector((state) => state.login.userId);
    
    return(
        <GroupMemberListWrapper extraStyling={props.extraStyling}>
            {groupMemberIds.map(memberId => (
                <UserTile key={memberId} memberId={memberId} listType={props.listType} isAdmin={administrators.includes(memberId)} editMode={props.editMode && administrators.includes(userId)} />
            ))}
        </GroupMemberListWrapper>
    )
}

GroupMemberList.propTypes = {
    editMode: PropTypes.bool,
    groupMemberIds: PropTypes.array,
    listType: PropTypes.string
}

export default GroupMemberList
