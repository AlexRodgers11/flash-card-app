import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import { client } from '../utils';
import styled from 'styled-components';
import UserIcon from './UserIcon';
import { AiOutlinePlus } from "react-icons/ai";

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const GroupTileWrapper = styled.div`
    display: flex;
    // border: 1px solid black;
    // border-radius: .8rem;
    width: 100%;
    height: 10rem;
    margin-bottom: 1rem;
    // padding: 1rem;
    // background-color: white;
    cursor: pointer;
    // @media(min-width: )
`;

const NameSection = styled.section`
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
    font-size: 2rem;
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
`;

const TopBlock = styled.div`
    height: 50%;
    display: flex;
    align-items: center;
`;

const BottomBlock = styled.div`
    height: 50%;
    display: flex;
    align-items: center;
`;

const UserIconsWrapper = styled.div`
    display: flex;
    align-items: center;
    white-space: nowrap;
`;

function GroupTile(props) {
    const [groupData, setGroupData] = useState();
    const [overflowSliceIndex, setOverFlowSliceIndex] = useState();
    const [width, setWidth] = useState();
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
        console.log("In resizing useEffect");
        let timeoutId;
        
        const handleWindowResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setOverFlowSliceIndex(undefined);
                setWidth(window.innerWidth);
                const topBlockWidth = topBlockRef.current.offsetWidth;
                const userIconsWidth = userIconsRef.current.offsetWidth;

                if(userIconsWidth > topBlockWidth) {
                    //get the width of the first userIcon
                    const userIconWidth = userIconsRef.current.children[1].offsetWidth;
                    console.log({userIconWidth});
                    console.log({topBlockWidth});
                    console.log({userIconsWidth});
                    const overFlowWidth = userIconsWidth - topBlockWidth;
                    const numIconsOverflowing = Math.ceil(overFlowWidth / (userIconWidth + 1.6));
                    const lastNonOverFlowingIconIndex = userIconsRef.current.children.length - numIconsOverflowing - 1;
                    setOverFlowSliceIndex(lastNonOverFlowingIconIndex);
                } else {
                    setOverFlowSliceIndex(undefined);
                }
            }, 300);
        }

        window.addEventListener("resize", handleWindowResize);
        
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", handleWindowResize);
        };
    }, [width]);


    if(!groupData) {
        return;
    }
  
    return (
        <GroupTileWrapper role="button" className="GroupTileWrapper" tabIndex={0} onKeyDown={handleViewOnEnter} onClick={handleViewGroup} >
            <NameSection style={{fontSize: "200%"}}>{groupData.name}</NameSection>
            <InfoSection>
                <TopBlock ref={topBlockRef} className="TopBlock"> 
                    <UserIconsWrapper ref={userIconsRef}>
                        <span>Members:</span>
                        {overflowSliceIndex ? 
                            <>
                            {groupData.memberIds.map(id => <UserIcon key={id} memberId={id} width={3} height={3} />
                            )}
                            <AiOutlinePlus></AiOutlinePlus>
                            </>
                            :
                            groupData.memberIds.map(id => <UserIcon key={id} memberId={id} width={3} height={3} />)
                        }
                        
                    </UserIconsWrapper>
                </TopBlock>
                <BottomBlock>
                    <span>{groupData.deckCount} decks</span>
                    <span>Joined: 7/15/22</span>
                </BottomBlock>
            </InfoSection>
        </GroupTileWrapper>
    )
}

GroupTile.propTypes = {
    groupId: PropTypes.string
}

export default GroupTile
