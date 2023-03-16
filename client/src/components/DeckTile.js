import React, { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '../utils';
import { useLocation, useNavigate, useParams } from 'react-router';
import PropTypes from 'prop-types';
import { RxEyeOpen, RxEyeClosed } from "react-icons/rx";
import { SlOptions } from "react-icons/sl";
import styled from 'styled-components';
import { batch, useDispatch, useSelector } from 'react-redux';
import { removeDeckFromUser } from '../reducers/loginSlice';
import { deleteDeck } from '../reducers/decksSlice';

const DeckTileWrapper = styled.div`
    display: inline-flex; 
    flex-direction: column;    
    text-align: center;  
    justify-content: center;
    position: relative;
    border: 1px solid black; 
    border-radius: 1rem; 
    margin: 1em;
    cursor: pointer;
    height: 4.25rem;
    width: 3.25rem;
    border-radius: .65rem;
    background-color: white;
    // box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease-in-out;
    &:hover {
        transform: translateY(-7px);
    }

    @media (min-width: 475px) {
        height: 7.5rem;
        width: 5.75rem;
        border-radius: .8rem;
        border-width: 2px;
    }
    
    @media (min-width: 535px) {
        height: 8.5rem;
        width: 6.75rem;
        border-radius: 1rem;
    }

    @media (min-width: 795px) {
        height: 11rem; 
        width: 8rem; 
    }
    
    @media (min-width: 960px) {
        height: 14rem; 
        width: 10rem; 
    }

    @media (min-width: 1310px) {
        height: 17rem;
        width: 13rem;
    }
    
`

const IndicatorsWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .1rem .1rem 0 .1rem;
    
    @media (min-width: 475px) {
        padding: .45rem .45rem 0 .45rem;
    }
    
    @media (min-width: 535px) {
        padding: .6rem .6rem 0 .6rem;
    }
    
    @media (min-width: 795px) {
        padding: .75rem .75rem 0 .75rem;
    }
    
`

const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-weight: 600;
    // font-family: Consolas;
    font-family: monospace;
    & img {
        height: 7rem;
        width: 100%;
    }
    & .large-name {
        // font-size: .6rem;
        // @media (min-width: 475px) {
        //     font-size: .75rem;
        // }
        
        // @media (min-width: 535px) {
        //     font-size: 1rem;
        // }
    
        // @media (min-width: 795px) {
        //     font-size: 1.25rem
        // }

        
        // @media (min-width: 960px) {
        //     // font-size: 2rem;
        //     font-size: 100%;
        // }
    }
    & .medium-name {
        //once I decide size at which to not display image set font-size to be the same as large-name
        // font-size: .45rem;
        // @media (min-width: 475px) {
        //     font-size: .5625rem;
        // }
        // @media (min-width: 535px) {
        //     font-size: .75rem;
        // }
        // @media (min-width: 795px) {
        //     font-size: .8375rem;
        // }
        // @media (min-width: 960px) {
        //     font-size: 1.5rem;
        // }
    }
`

const StyledOpenEye = styled(RxEyeOpen)`
    display: inline-block;
    // justify-self: start;
    margin: 0rem;
    height: .5rem;
    width: .5rem;
    @media (min-width: 475px) {
        height: .75rem;
        width: .75rem;
    }
    
    @media (min-width: 535px) {
        height: 1rem;
        width: 1rem;
    }

    @media (min-width: 795px) {
        height: 1.25rem;
        width: 1.25rem;
    }
`

const StyledClosedEye = styled(RxEyeClosed)`
    display: inline-block;
    // justify-self: start;
    margin: 0rem;
    height: .5rem;
    width: .5rem;
    @media (min-width: 475px) {
        height: .75rem;
        width: .75rem;
    }
    
    @media (min-width: 535px) {
        height: 1rem;
        width: 1rem;
    }

    @media (min-width: 795px) {
        height: 1.25rem;
        width: 1.25rem;
    }
`

const StyledOptionsIcon = styled(SlOptions)`
    display: inline-block;
    // justify-self: end;
    margin: 0rem;
    height: .5rem;
    width: .5rem;
    @media (min-width: 475px) {
        height: .75rem;
        width: .75rem;
    }

    @media (min-width: 535px) {
        height: 1rem;
        width: 1rem;
    }

    @media (min-width: 795px) {
        height: 1.25rem;
        width: 1.25rem;
    }
`;

const Options = styled.ul`
    display: inline-block;
    padding: 0;
    display: inline-block;
    align-self: start;
    text-align: left;
    background-color: white;
    border: 1px solid black;
    margin-left: calc(.1rem - 1px);
    
    @media (min-width: 475px) {
        margin-left: calc(.45rem - 2px)
    }
    
    @media (min-width: 535px) {
        margin-left: calc(.6rem - 2px);
        border-width: 2px
    }
    
    @media (min-width: 795px) {
        margin-left: calc(.75rem - 2px);
    }
    
`;

const Option = styled.li`
    padding: .25rem .5rem; 
    font-size: .35rem;
    padding: .05rem .1rem;
    border-bottom: 1px solid black;
    border-top: 1px;
    
    &:first-of-type {
        border-top: none;
    }
    &:last-of-type {
        border-bottom: none;
    }
    &:hover {
        background-color: black;
        color: white;
    }
    
    @media (min-width: 475px) {
        font-size: .5rem;
        padding: .1rem .2rem;
    }
    
    @media (min-width: 535px) {
        font-size: .6rem;
        padding: .15rem .3rem;
    }

    @media (min-width: 795px) {
        font-size: .8rem;
        padding: .2rem .4rem;
    }
    
    @media (min-width: 960px) {
        font-size: 1rem;
        padding: .25rem .5rem;
    }
`;

const CardCountWrapper = styled.p`
    position: relative; 
    // left: .2rem;
    padding-left: .12rem;
    display: inline-flex;
    align-items: center;
    font-size: .75rem;
     
    margin: 0rem;
    & span:nth-of-type(1) {
        padding-right: 1px;
    }
    & span:nth-of-type(2) {
        position: relative; 
        bottom: .15rem;
        display: inline-block;
        height: .5rem;
        width: .4rem;
        bottom: .075rem;
        border: 1px solid black;
        border-radius: .1rem; 
        opacity: 1; 
        z-index: 2;
        background-color: white;
    }
    & span:nth-of-type(3) {
        position: relative;
        height: .5rem;
        width: .4rem;
        top: .075rem;
        right: .25rem;
        display: inline-block;

        border: 1px solid black; 
        borderRadius: .1rem;
    }
    font-size: .5rem;
    
    @media (min-width: 475px) {
        font-size: .75rem;
        // left: .5rem;
        padding-left: .2rem;
        & span:nth-of-type(2) {
            height: .6rem;
            width: .48rem;
            bottom: .09rem;
        }
        & span:nth-of-type(3) {
            height: .6rem;
            width: .48rem;
            top: .09rem;
            right: .3rem;
        }
    }
    
    @media (min-width: 535px) {
        font-size: 1rem;
        & span:nth-of-type(2) {
            height: .8rem;
            width: .64rem;
            bottom: .12rem;
        }
        & span:nth-of-type(3) {
            height: .8rem;
            width: .64rem;
            top: .12rem;
            right: .4rem;
        }

    }

    @media (min-width: 795px) {
        & span:nth-of-type(2) {
            height: 1rem;
            width: .8rem;
            bottom: .15rem;
        }
        & span:nth-of-type(3) {
            height: 1rem;
            width: .8rem;
            top: .15rem;
            right: .5rem;
        }
    }
`;

const TopWrapper = styled.div`
    position: absolute;
    top: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    // align-items: start;
`;

const RightBlock = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    left: .2rem;
    @media (min-width: 475px) {
        left: .5rem;
    }

`;

const baseURL = 'http://localhost:8000';

function DeckTile(props) {
    const userId = useSelector((state) => state.login.userId);
    const params = useParams();
    const listType = useSelector((state) => state.decks.listType);
    const [deckData, setDeckData] = useState({});
    const [fontSize, setFontSize] = useState(20);
    const [doneResizing, setDoneResizing] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const administrators = useSelector((state) => state.group.administrators);
    const groupId = useSelector((state) => state.group.groupId);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const rootRef = useRef();
    const indicatorsRef = useRef();
    const contentRef = useRef();

    const handleSelection = () => {
        if(showOptions) {
            return;
        }
        //SEE IF OKAY TO DO THIS WAY- COULD BE UNSAFE AND ALLOW NAVIGATION TO PRIVATE DECKS
        // if(location.pathname.slice(32, 33) === "p") {
        //     navigate();
        // } else if(location.pathname.slice(32, 33) === "d" || location.pathname.slice(1, 2) === "u") {
        //     navigate(`/decks/${props.deckId}`)
        // } else if(location.pathname.slice(1,2) === "g") {
        //     navigate(`/groups/${groupId}/decks/${props.deckId}`);
        // }
        if(location.pathname.includes("group")) {
            navigate(`/groups/${groupId}/decks/${props.deckId}`);
        } else if(location.pathname.includes("practice")) {
            navigate(`/users/${userId}/decks/${props.deckId}/practice-session`);
        } else {
            navigate(`/decks/${props.deckId}`);
        }
    }

    const stopClickPropagation = (evt) => {
        evt.stopPropagation();
    }

    const closeOptions = () => {
        setShowOptions(false);
    }
    
    const displayOption = () => {
        switch(listType) {
            case "user":
                return params.userId === userId;
            case "group":
                return administrators.includes(userId);
            default:
                return false;
        }
    }

    const handleOptionSelection = (evt) => {
        evt.stopPropagation();
        switch(evt.target.dataset.option) {
            case "practice":
                navigate(`/users/${userId}/decks/${props.deckId}/practice-session`);
                break;
            case "view":
                navigate(`/decks/${props.deckId}`);
                break;
            case "edit":
                navigate(`/decks/${props.deckId}`);
                break;
            case "delete":
                batch(() => {
                    dispatch(deleteDeck(props.deckId));
                    dispatch(removeDeckFromUser(props.deckId));
                });
                break;
            default:
                break;
        }
        setShowOptions(false);
    }
    
    const handleResize = useCallback(() => {
        const tile = rootRef.current;
        const words = rootRef.current.querySelectorAll(".word");
        const content = contentRef.current;
        const indicators = indicatorsRef.current;

        let needsResizing = false;

        words.forEach((word) => {
            if(word.offsetWidth > tile.offsetWidth * .95) {
                needsResizing = true;

            }
        });

        if(content.offsetHeight > tile.offsetHeight - (2 * indicators.offsetHeight)) {
            needsResizing = true;
        }

        if(needsResizing) {
            setTimeout(() => {
                setFontSize(fontSize * .9); 
            }, 0);
        } else {
            setDoneResizing(true);
        }

    }, [fontSize]);

    
    const handleKeyPress = (evt) => {
        if(evt.keyCode === 13) {
            handleSelection();
        }
    }

    const handleToggleOptions = (evt) => {
        evt.stopPropagation();
        setShowOptions(prevStatus => !prevStatus);
    }

    const firstRender = useRef(true);
    useEffect(() => {
        if(firstRender.current) {
            firstRender.current = false;
        } else {
            if(showOptions) {
                window.addEventListener("click", closeOptions);
            }
            return () => {
                window.removeEventListener("click", closeOptions);
            }
        }
    }, [showOptions, setShowOptions]);

    useEffect(() => {
        client.get(`${baseURL}/decks/${props.deckId}/tile`)
            .then((response) => setDeckData(response.data))
            .catch((err) => console.log(err));
    }, [props.deckId]);


    //check font-size upon data loading
    useEffect(() => {
        if(deckData.name) {
            handleResize();
        }
    }, [deckData, handleResize]);

    //re-evaluate font-size upon window resize 
    useEffect(() => {        
        let timeoutId;
        
        const handleWindowResize = () => {
            setDoneResizing(false);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const width = window.innerWidth;
                console.log({width});
                switch(width) {
                    case width <= 475:
                        if(deckData.url) {
                            setFontSize(8);
                        } else {
                            setFontSize(10);
                        } 
                        break;
                    case width <= 535:
                        if(deckData.url) {
                            setFontSize(9);
                        } else {
                            setFontSize(12);
                        } 
                        break;
                    case width <= 795:
                        if(deckData.url) {
                            setFontSize(12);
                        } else {
                            setFontSize(16);
                        } 
                        break;
                    case width <= 960:
                        if(deckData.url) {
                            setFontSize(14);
                        } else {
                            setFontSize(24);
                        } 
                        break;
                    default: 
                    if(deckData.url) {
                        setFontSize(24);
                    } else {
                        setFontSize(32);
                    } 
                    break;
                }
                // setFontSize(20);
                handleResize();
            }, 300);
        }

        window.addEventListener("resize", handleWindowResize);
        
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", handleWindowResize);
        };
      }, [deckData.url, handleResize]);
  
    return (
        <DeckTileWrapper ref={rootRef} role="button" id="tile" className="DeckTileWrapper" tabIndex={0} onKeyDown={handleKeyPress} onClick={handleSelection} >
            <TopWrapper>
                <IndicatorsWrapper ref={indicatorsRef} className="IndictorsWrapper" onClick={stopClickPropagation}>
                    <StyledOptionsIcon role="button" onClick={handleToggleOptions} />
                    <RightBlock>
                        {deckData.publiclyAvailable ? <StyledOpenEye /> : <StyledClosedEye className="StyledClosedEye" />}
                        <CardCountWrapper>
                            <span>{deckData.cardCount}</span>
                            <span />
                            <span />
                        </CardCountWrapper>
                    </RightBlock>
                </IndicatorsWrapper>
                {showOptions &&
                    <Options>
                        <Option role="button" data-option="practice" onClick={handleOptionSelection}>Practice</Option>
                        <Option role="button" data-option="view" onClick={handleOptionSelection}>View</Option>
                        {(!props.noEdit && displayOption()) && <Option role="button" data-option="edit" onClick={handleOptionSelection}>Edit</Option>}
                        {(!props.noEdit && displayOption()) && <Option role="button" data-option="delete" onClick={handleOptionSelection}>Delete</Option>}
                    </Options>
                }
            </TopWrapper>
            <ContentWrapper ref={contentRef}>
                {deckData.url && <img src={deckData.url} alt="profile-avatar"/>}
                {/* <p className={deckData.url ? "medium-name" : "large-name"}>{deckData.name}</p> */}
                <p className={deckData.url ? "medium-name" : "large-name"} style={{...(fontSize && {fontSize: fontSize}), opacity: doneResizing ? 1 : 0}}>{deckData?.name?.split(" ").map(word => <span className="word">{word} </span>)}</p>
            </ContentWrapper>
        </DeckTileWrapper>
    );
}

DeckTile.propTypes = {
    deckId: PropTypes.string, 
    noEdit: PropTypes.bool
}

export default DeckTile