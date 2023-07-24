import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import { client } from '../utils';
import styled from 'styled-components';
import UserIcon from './UserIcon';
import { AiOutlinePlus } from "react-icons/ai";
import { HiRectangleStack, HiUser, HiUsers } from "react-icons/hi2";
import { TbRectangleVertical } from "react-icons/tb";

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const StyledHiRectangleStack = styled(HiRectangleStack)`
    transform: rotate(90deg);
    height: 2rem;
    width: 2rem;
`;

const StyledTbRectangleVertical = styled(TbRectangleVertical).attrs({
    fill: "black"
})`
    height: 2rem;
    width: 2rem;
`;

const GroupTileWrapper = styled.div`
    display: flex;
    width: 100%;
    height: 10rem;
    margin-bottom: 1rem;
    cursor: pointer;
    border-radius: .8rem;
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0px 2px 4px #000000;
    }   
`;

const LabelSection = styled.section`
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: blue;
    border: 1px solid black;
    border-top-left-radius: .8rem;
    border-bottom-left-radius: .8rem;
    height: 100%;
    width: 30%;
    color: white;
    @media (max-width: 750px) {
        width: 70%;
    }
`;

const InfoSection = styled.section`
    display: inline-block;
    border: 1px solid black;
    border-top-right-radius: .8rem;
    border-bottom-right-radius: .8rem;
    overflow: hidden;
    width: 70%;
    height: 100%;
    background-color: white;
    @media (max-width: 750px) {
        width: 30%;
    }
`;

const TopBlock = styled.div`
    height: 50%;
    display: flex;
    align-items: center;
    padding-left: .5rem;
    @media (max-width: 750px) {
        padding-left: 0;    
        justify-content: center;
    }
`;

const BottomBlock = styled.div`
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 calc(.5rem + 1px);
    @media (max-width: 750px) {
        padding-left: 0;    
        justify-content: center;
    }
`;

const UserIconsWrapper = styled.div`
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
`;

const StyledHiUser = styled(HiUser)`
    height: 2rem;
    width: 2rem;
`;

const StyledHiUsers = styled(HiUsers)`
    height: 2rem;
    width: 2rem;
`;

const Name = styled.h1`
    // height: 100%;
    width: 100%;
    word-wrap: break-word;
    font-size: 2rem;
    position: absolute;
`;

const DateJoined = styled.p`
    font-family: 'Bookman Old Style', sans-serif;
    font-weight: 600;
    @media (max-width: 750px) {
        color: white;
        align-self: flex-end;
        font-size: .75rem;
    }
`;

const Count = styled.span`
    font-weight: 500;
`;

function GroupTile(props) {
    const [groupData, setGroupData] = useState();
    const [overflowSliceIndex, setOverFlowSliceIndex] = useState();
    const [width, setWidth] = useState();
    const [resizing, setResizing] = useState(false);
    const topBlockRef = useRef();
    const userIconsRef = useRef();
    const navigate = useNavigate();
    
    const handleViewGroup = (evt) => {
        navigate(`/groups/${props.groupId}/decks`);
    }

    const handleViewOnEnter = (evt) => {
        if(evt.keyCode === 13) {
            navigate(`/groups/${props.groupId}`);
        }
    }    

    useEffect(() => {
        client.get(`${baseURL}/groups/${props.groupId}?tile=true`)
            .then((response) => setGroupData(response.data))
            .catch((err) => console.log(err));
    }, [props.groupId]);

    useEffect(() => {
        setWidth(window.innerWidth);
    }, [groupData]);

    useEffect(() => {  
        let timeoutId;

        const handleWindowResize = () => {
            setResizing(true);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setOverFlowSliceIndex(undefined);
                setWidth(window.innerWidth);
                const topBlockWidth = Math.floor(topBlockRef?.current?.getBoundingClientRect().width) - 8;
                const userIconWidth = Math.ceil(userIconsRef?.current?.children[1].getBoundingClientRect().width);
                const userIconsWidth = (userIconWidth + 4) * groupData.memberIds.length;

                if(userIconsWidth > topBlockWidth) {
                    const numIconsThatFit = Math.floor((topBlockWidth - 16) / (userIconWidth + 4));
                    const lastNonOverFlowingIconIndex = numIconsThatFit;
                    setOverFlowSliceIndex(lastNonOverFlowingIconIndex);
                } else {
                    setOverFlowSliceIndex(undefined);
                }
            }, 300);
            setResizing(false);
        }

        if(!overflowSliceIndex) {
            handleWindowResize();
        }

        window.addEventListener("resize", handleWindowResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", handleWindowResize);
        };
    }, [groupData, overflowSliceIndex, width]);


    if(!groupData || resizing) {
        return;
    }
  
    return (
        <GroupTileWrapper role="button" className="GroupTileWrapper" tabIndex={0} onKeyDown={handleViewOnEnter} onClick={handleViewGroup} >
            <LabelSection>
                <Name>{groupData.name}</Name>
                {width <= 750 && <DateJoined>Joined: 7/15/22</DateJoined>}
            </LabelSection>
            <InfoSection>
                <TopBlock ref={topBlockRef} className="TopBlock"> 
                    {(width > 750) && 
                        <UserIconsWrapper className="UserIconsWrapper" ref={userIconsRef}>
                            {overflowSliceIndex ? 
                                <>
                                {groupData.memberIds.slice(0, overflowSliceIndex).map(id => <UserIcon key={id} memberId={id} width={3} height={3} />
                                )}
                                <div><AiOutlinePlus /></div>
                                </>
                                :
                                groupData.memberIds.map(id => <UserIcon key={id} memberId={id} width={3} height={3} />)
                            }
                        </UserIconsWrapper>
                    }
                    {width <= 750 && 
                        <>
                            <span>{groupData.memberIds.length > 1 ? <StyledHiUsers /> : <StyledHiUser />}</span>
                            <Count>{groupData.memberIds.length}</Count>
                        </>
                    }
                </TopBlock>
                <BottomBlock>
                    <div>
                        <span>{groupData.deckCount > 1 ? <StyledHiRectangleStack /> : <StyledTbRectangleVertical />}</span>
                        <Count>{groupData.deckCount}</Count>
                    </div>
                    {width > 750 && <DateJoined>Joined: 7/15/22</DateJoined>}
                </BottomBlock>
            </InfoSection>
        </GroupTileWrapper>
    )
}

GroupTile.propTypes = {
    groupId: PropTypes.string
}

export default GroupTile
