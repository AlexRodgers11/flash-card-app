import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PropTypes from 'prop-types';
import axios from "axios";
import { RxEyeOpen, RxEyeClosed } from "react-icons/rx";
import styled from 'styled-components';

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
    grid-column: span 1;
    position: absolute;
    top: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .45rem;
    paddingBottom: 0rem;
    
    @media (min-width: 535px) {
        padding: .6rem;
    }

    @media (min-width: 795px) {
        padding: .75rem;
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
    justify-self: start;
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
    justify-self: start;
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

const CardCountWrapper = styled.p`
    position: relative; 
    left: .5rem;
    display: inline-flex;
    align-items: center;
    justify-self: end;
    font-size: .75rem;
     
    margin: 0rem;
    & span:nth-of-type(1) {
        padding-right: .1rem;
    }
    & span:nth-of-type(2) {
        position: relative; 
        bottom: .15rem;
        display: inline-block;
        // height: 1rem;
        // width: .8rem;
        height: .6rem;
        width: .48rem;
        bottom: .09rem;
        border: 1px solid black;
        border-radius: .1rem; 
        opacity: 1; 
        z-index: 2;
        background-color: white;
    }
    & span:nth-of-type(3) {
        position: relative;
        // top: .15rem;
        // right: .5rem;
        height: .6rem;
        width: .48rem;
        top: .09rem;
        right: .3rem;
        display: inline-block;
        // height: 1rem;
        // width: .8rem;
        border: 1px solid black; 
        borderRadius: .1rem;
    }
    font-size: .5rem;
    
    @media (min-width: 475px) {
        font-size: .75rem;
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
        // & span:nth-of-type(2) {
        //     height: .5rem;
        //     width: .4rem;
        //     bottom: .075rem;
        // }
        // & span:nth-of-type(3) {
        //     height: .5rem;
        //     width: .4rem;
        //     top: .075rem;
        //     right: .25rem;
        // }
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
            top: ..12rem;
            right: .4rem;
        }
        // & span:nth-of-type(2) {
        //     height: .5rem;
        //     width: .4rem;
        //     bottom: .075rem;
        // }
        // & span:nth-of-type(3) {
        //     height: .5rem;
        //     width: .4rem;
        //     top: .075rem;
        //     right: .25rem;
        // }
    }

    @media (min-width: 795px) {
        // font-size: 1.25rem;
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
`

const baseURL = 'http://localhost:8000';

function DeckTile(props) {
    const [deckData, setDeckData] = useState({});
    const [fontSize, setFontSize] = useState(20);
    const [doneResizing, setDoneResizing] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const rootRef = useRef();

    const handleSelection = () => {
        //SEE IF OKAY TO DO THIS WAY- COULD BE UNSAFE AND ALLOW NAVIGATION TO PRIVATE DECKS
        if(location.pathname.slice(32, 33) === "p") {
            navigate(`/users/${deckData.creatorId}/decks/${props.deckId}/practice-session`);
        } else if(location.pathname.slice(32, 33) === "d" || location.pathname.slice(1, 2) === "u") {
            navigate(`/decks/${props.deckId}`)
        } else if(location.pathname.slice(1,2) === "g") {
            navigate(`/decks/${props.deckId}`);
        }
    }
    
    const handleResize = useCallback(() => {
        const tile = rootRef.current;
        const words = rootRef.current.querySelectorAll(".word");
        let needsResizing = false;

        words.forEach((word) => {
            if(word.offsetWidth > tile.offsetWidth * .95) {
                needsResizing = true;

            }
        });

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

    useEffect(() => {
        axios.get(`${baseURL}/decks/${props.deckId}/tile`)
            .then((response) => setDeckData(response.data))
            .catch((err) => console.log(err));
    }, [props.deckId]);


    //check font-size upon data loading
    useEffect(() => {
        if(deckData.name) {
            handleResize();
        }
    }, [deckData, handleResize]);

    //re-evaluate font-size upon 
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
        <DeckTileWrapper ref={rootRef} id="tile" className="DeckTileWrapper" tabIndex={0} onKeyDown={handleKeyPress} onClick={handleSelection} >
            <IndicatorsWrapper className="IndictorsWrapper">
                {deckData.publiclyAvailable ? <StyledOpenEye /> : <StyledClosedEye className="StyledClosedEye" />}
                <CardCountWrapper>
                    <span>{deckData.cardCount}</span>
                    <span />
                    <span />
                </CardCountWrapper>
            </IndicatorsWrapper>
            <ContentWrapper>
                {deckData.url && <img src={deckData.url} alt="profile-avatar"/>}
                {/* <p className={deckData.url ? "medium-name" : "large-name"}>{deckData.name}</p> */}
                <p className={deckData.url ? "medium-name" : "large-name"} style={{...(fontSize && {fontSize: fontSize}), opacity: doneResizing ? 1 : 0}}>{deckData?.name?.split(" ").map(word => <span className="word">{word} </span>)}</p>
            </ContentWrapper>
        </DeckTileWrapper>
    )
}

DeckTile.propTypes = {
    deckId: PropTypes.string
}

export default DeckTile