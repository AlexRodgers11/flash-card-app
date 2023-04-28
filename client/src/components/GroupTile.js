import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import { client } from '../utils';
import styled from 'styled-components';
import UserIcon from './UserIcon';
import { AiOutlinePlus } from "react-icons/ai";
import { HiUser, HiUsers } from "react-icons/hi2";

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
    padding-left: .5rem;
`;

const BottomBlock = styled.div`
    height: 50%;
    display: flex;
    align-items: center;
    padding-left: calc(.5rem + 1px);
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
            <NameSection style={{fontSize: "200%"}}>{groupData.name}</NameSection>
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
                        <span>{groupData.memberIds.length > 1 ? <StyledHiUsers /> : <StyledHiUser />}{groupData.memberIds.length}</span>
                    }
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
