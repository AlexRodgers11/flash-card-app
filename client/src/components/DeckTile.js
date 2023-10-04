import React, { useState, useEffect, useCallback, useRef } from 'react';
import { client } from '../utils';
import { useLocation, useNavigate, useParams } from 'react-router';
import PropTypes from 'prop-types';
import { batch, useDispatch, useSelector } from 'react-redux';
import { removeDeckFromUser } from '../reducers/loginSlice';
import { deleteDeck } from '../reducers/decksSlice';
import { copyDeck } from '../reducers/loginSlice';
import { addDeckToCurrentDeckList } from '../reducers/decksSlice';
import { setDeckIdInSetup, setPracticeDeckGroup } from '../reducers/practiceSessionSlice';
import useToggle from '../hooks/useToggle';
import Modal from './Modal';
import { DeckTileWrapper, TopWrapper, IndicatorsWrapper, StyledOptionsIcon, RightBlock, StyledOpenEye, StyledClosedEye, CardCountWrapper, Options, Option, ContentWrapper } from './StyledComponents/DeckTileStyles';
import styled from 'styled-components';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const ButtonWrapper = styled.div`
	display: flex;
	justify-content: center;
	padding-top: 2.5rem;
	& button {
		margin: 0 .75rem;
		@media (max-width: 330px) {
			margin: 0 .375rem;
		}
	}
	@media (max-width: 330px) {
		padding-top: 2rem;
	}
`;

function DeckTile(props) {
    const userId = useSelector((state) => state.login.userId);
    const params = useParams();
    const listType = useSelector((state) => state.decks.listType);
    const listId = useSelector((state) => state.decks.listId);
    const [deckData, setDeckData] = useState({});
    const [fontSize, setFontSize] = useState(20);
    const [doneResizing, setDoneResizing] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showNoCardsModal, toggleShowNoCardsModal] = useToggle(false);
    const [showStatsNotTrackedModal, toggleShowStatsNotTrackedModal] = useToggle(false);
    const userDeckIds = useSelector((state) => state.login.decks.map((deck) => deck._id));
    const userGroupIds = useSelector((state) => state.login.groups);
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
        if(location.pathname.includes("group")) {
            navigate(`/groups/${groupId}/decks/${props.deckId}`);
        } else if(location.pathname.includes("practice")) {
            if(deckData.cardCount > 0) {
                // navigate(`/users/${userId}/decks/${props.deckId}/practice-session`);
                dispatch(setDeckIdInSetup({deckId: props.deckId}));
                if(deckData.groupDeckBelongsTo) {
                    dispatch(setPracticeDeckGroup({groupId: deckData.groupDeckBelongsTo}));
                }
            } else {
                toggleShowNoCardsModal();
            }
        } else {
            navigate(`/users/${deckData.creator}/decks/${props.deckId}`);
        }
    }

    const stopClickPropagation = (evt) => {
        evt.stopPropagation();
    }

    const closeOptions = () => {
        setShowOptions(false);
    }

    const goToDeck = () => {
        if(listType === "user") {
            navigate(`/users/${userId}/decks/${props.deckId}`);
        } else {
            navigate(`/groups/${listId}/decks/${props.deckId}`);   
        }
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
                if(deckData.cardCount > 0) {
                    if(location.pathname.includes("public") && (!userDeckIds.includes(props.deckId) && !userGroupIds.includes(deckData.groupDeckBelongsTo))) {
                        toggleShowStatsNotTrackedModal();
                    } else {
                        dispatch(setDeckIdInSetup({deckId: props.deckId}));
                        // navigate(`/users/${userId}/decks/${props.deckId}/practice-session`);
                        if(deckData.groupDeckBelongsTo) {
                            dispatch(setPracticeDeckGroup({groupId: deckData.groupDeckBelongsTo}));
                        }
                    }
                } else {
                    toggleShowNoCardsModal();
                }
                break;
            case "view":
                if(deckData.groupDeckBelongsTo) {
                    navigate(`/groups/${deckData.groupDeckBelongsTo}/decks/${props.deckId}`);
                } else {
                    navigate(`/users/${deckData.creator}/decks/${props.deckId}`);
                }
                break;
            case "edit":
                if(deckData.groupDeckBelongsTo) {
                    navigate(`/groups/${deckData.groupDeckBelongsTo}/decks/${props.deckId}`);
                } else {
                    navigate(`/users/${userId}/decks/${props.deckId}`);
                }
                break;
            case "delete":
                batch(() => {
                    dispatch(deleteDeck(props.deckId));
                    dispatch(removeDeckFromUser(props.deckId));
                });
                break;
            case "copy":
                dispatch(copyDeck({deckId: props.deckId, userId: userId}))
                    .then(action => {
                        if(listType === "user") {
                            dispatch(addDeckToCurrentDeckList({deckId: action.payload._id}));
                        }
                    });
                break;
            default:
                break;
        }
        setShowOptions(false);
    }

    const practicePublicDeck = () => {
        if(deckData.groupDeckBelongsTo) {
            dispatch(setPracticeDeckGroup({groupId: deckData.groupDeckBelongsTo}));
        }
        navigate(`/users/${userId}/decks/${props.deckId}/practice-session`);
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
        <>
        {showNoCardsModal && 
            <Modal hideModal={toggleShowNoCardsModal}>
                <p>This deck doesn't have any cards. Add cards to the deck in order to practice it.</p>
                <button onClick={goToDeck}>Go to Deck</button>
            </Modal>
        }
        {showStatsNotTrackedModal && 
            <Modal hideModal={toggleShowStatsNotTrackedModal}>
                <p>Statistics for practice sessions with other users' decks aren't tracked. If the user allows copies to be made adding a copy to your decks will allow you to practice it there and have your attempts tracked.</p>
                <ButtonWrapper>
                    <button className="btn btn-danger" onClick={toggleShowStatsNotTrackedModal}>Cancel</button>
                    <button className="btn btn-primary" onClick={practicePublicDeck}>Practice Anyway</button>
                </ButtonWrapper>
            </Modal>
        }
        <DeckTileWrapper ref={rootRef} role="button" id="tile" className="DeckTileWrapper" tabIndex={0} onKeyDown={handleKeyPress} onClick={handleSelection} >
            <TopWrapper>
                    <IndicatorsWrapper ref={indicatorsRef} className="IndictorsWrapper" onClick={stopClickPropagation}>
                        {!location.pathname.includes("practice") ?
                            <StyledOptionsIcon role="button" onClick={handleToggleOptions} />
                            :
                            <span></span>
                        }
                        <RightBlock>
                            {!location.pathname.includes("practice") ? deckData.publiclyAvailable ? <StyledOpenEye /> : <StyledClosedEye className="StyledClosedEye" /> : <span></span>}
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
                        {deckData.allowCopies && <Option role="button" data-option="copy" onClick={handleOptionSelection}>Copy</Option>}
                        {/* <Option role="button" data-option="copy" className={deckData.allowCopies ? "" : "disabled"} data-bs-toggle={deckData.allowCopies ? "" : "tooltip"} data-bs-placement={deckData.allowCopies ? "" : "top"} title={deckData.allowCopies ? "" : "This deck is not allowed to be copied"} onClick={deckData.allowCopies ? handleOptionSelection : null}>Copy</Option> */}
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
        </>
    );
}

DeckTile.propTypes = {
    deckId: PropTypes.string, 
    noEdit: PropTypes.bool
}

export default DeckTile