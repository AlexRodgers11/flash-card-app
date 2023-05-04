import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { client } from '../utils';
import { setFilters, setQuickPracticeNumCards, setQuickPracticeSelection } from '../reducers/practiceSessionSlice';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const SessionSetupFormWrapper = styled.div`
    min-width: 30rem;
    border: 2px solid black;
`;

const PracticeAll = styled.div`
    padding: 1rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: ${props => props.cardsLength > 1 ? "2px solid black" : "none"};
    & h2 {
        display: inline-block;
    }
`;

const DividerContainer = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: .75rem;
    & hr {
        width: 100%;
        z-index: 0;
    }
`;

const OrContainer = styled.h2`
    display: inline-block;
    padding: .25rem;
    position: absolute;
    z-index: 1;
    background-color: white;
`;

const Section = styled.div`
    padding: 1rem;
    display: grid;
    & h2 {
        text-align: left;
        margin-bottom: 1rem;
    }
    & .HalfBlock:first-of-type {
        justify-content: center;
    }
    & .HalfBlock:nth-of-type(2) {
        align-items: center;
    }
    & .sliders {
        & input[type="range"] {
            width: 12rem;
        }
    }
`;

const QuickPractice = styled(Section)`
`;

const FilteredPractice = styled(Section)`
`;


const HalfBlock = styled.div`
    // width: calc((100% - 2rem) / 2);
    display: inline-flex;
    height: 100%;
    flex-direction: column;
`;

const ControlsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const OptionsBlock = styled.form`
    display: flex;
    // flex-direction: column;
    padding: 0 5%;
    justify-content: space-between;
`;

const ButtonWrapper = styled.div`
    width: 100%;
    & button {
        margin-top: 1.5rem;
        width: 50%;
        align-self: center;
    }
`;

const SliderValueDisplay = styled.p`
    width: 100%;
    font-weight: 600;
    padding-bottom: 1rem;
`;

function SessionSetupForm() {
    const dispatch = useDispatch();
	const navigate = useNavigate();
    const userId = useSelector((state) => state.login.userId);
	const deckInSetup = useSelector((state) => state.practiceSession.deckIdInSetup);
    const [cards, setCards] = useState();
    const [cardsFetched, setCardsFetched] = useState(false);
    const numCards = useSelector((state) => state.practiceSession.quickPracticeNumCards);
    const quickPracticeSelection = useSelector((state) => state.practiceSession.quickPracticeSelection);
    const filters = useSelector((state) => state.practiceSession.filters);

    const handleQuickPracticeSelectionChange = (evt) => {
        dispatch(setQuickPracticeSelection({selection: evt.target.value}));
    }

    const handleNumCardsChange = (evt) => {
        console.log({value: evt.target.value});
        dispatch(setQuickPracticeNumCards({numCards: Number(evt.target.value)}));
    }

    const handleFilterChange = (evt) => {
        if(["flashCard", "trueFalse", "multipleChoice"].includes(evt.target.id)) {
            dispatch(setFilters({filters: {...filters, [evt.target.id]: !filters[evt.target.id]}}));
        } else {
            dispatch(setFilters({filters: {...filters, [evt.target.id]: evt.target.value}}));
        }
    }

    const handlePracticeAllSubmit = (evt) => {
        evt.preventDefault();
        navigate(`/users/${userId}/decks/${deckInSetup}/practice-session`);
    }

    const handleQuickPracticeSubmit = (evt) => {
        evt.preventDefault();
        navigate(`/users/${userId}/decks/${deckInSetup}/practice-session`);
    }

    const handleFilteredPracticeSubmit = (evt) => {
        evt.preventDefault();
        navigate(`/users/${userId}/decks/${deckInSetup}/practice-session`);
    }

    useEffect(() => {
        if(!cardsFetched) {
            console.log("fetching cards");
            const fetchCards = async () => {
                try {
                    const response = await client.get(`${baseURL}/decks/${deckInSetup}/practice-setup`);
                    console.log({cards: response.data});
                    setCards(response.data);
                    setCardsFetched(true);
                } catch (err) {
                    console.error(err);
                }
            }
            fetchCards();
        }
    }, [cardsFetched, deckInSetup]);

    const getFilterPassingCount = () => {
        return cards.filter(card => {
            //check for card type
            switch(card.cardType) {
                case "FlashCard":
                    if(!filters.flashCard) {
                        return false;
                    }
                    break;
                case "TrueFalseCard":
                    if(!filters.trueFalse) {
                        return false;
                    }
                    break;
                case "MultipleChoiceCard":
                    if(!filters.multipleChoice) {
                        return false;
                    }
                    break;
                default:
                    return false;
            }

            //check for accuracy rate
            if(card.accuracyRate && card.accuracyRate > filters.accuracyRate) {
                return false;
            }

            //check for date last practiced
            if(card.lastPracticed && Date.now() - card.lastPracticed < Number(filters.lastPracticed)) {
                return false;
            }

            //check for date created
            if(Date.now() - card.dateCreated < Number(filters.dateCreated)) {
                return false;
            }
            return true
        }).length;
    }

    if(!cardsFetched) {
        return <></>
    }

  	return (
		<SessionSetupFormWrapper>
			<div>
                <PracticeAll onSubmit={handlePracticeAllSubmit} cardsLength={cards.length}>
                    <h2>Full Practice</h2>
                    <button className="btn btn-primary btn-lg">Practice all cards</button>
                </PracticeAll>
                {cards.length > 1 &&
                    <>
                        <QuickPractice className="QuickPractice">
                            <h2>Quick Practice</h2>
                            <OptionsBlock onSubmit={handleQuickPracticeSubmit} className="OptionsBlock">
                                <HalfBlock className="HalfBlock">
                                    <label htmlFor="quick-num-cards">Number of Cards</label>
                                    <select id="quick-num-cards" value={numCards} onChange={handleNumCardsChange}>
                                        {cards.slice(0, cards.length - 1).map((card, idx) => <option key={card.createdAt}>{idx + 1}</option>)}
                                    </select>
                                </HalfBlock>
                                <HalfBlock className="HalfBlock">
                                    <ControlsContainer>
                                        <div>
                                            <input 
                                                type="radio" 
                                                name="quick-selection" 
                                                id="random" 
                                                value="random" 
                                                checked={quickPracticeSelection === "random"} 
                                                onChange={handleQuickPracticeSelectionChange} />
                                            <label htmlFor="random">Random</label>

                                        </div>
                                        <div>
                                            <input 
                                                type="radio" 
                                                name="quick-selection" 
                                                id="least-practiced" 
                                                value="least-practiced" 
                                                checked={quickPracticeSelection === "least-practiced"}  
                                                onChange={handleQuickPracticeSelectionChange} />
                                            <label htmlFor="least-practiced">Least Practiced</label>
                                        </div>
                                        <div>
                                            <input 
                                                type="radio" 
                                                name="quick-selection" 
                                                id="lowest-accuracy" 
                                                value="lowest-accuracy" 
                                                checked={quickPracticeSelection === "lowest-accuracy"} 
                                                onChange={handleQuickPracticeSelectionChange} />
                                            <label htmlFor="lowest-accuracy">Lowest Accuracy</label>
                                        </div>
                                        <div>
                                            <input 
                                                type="radio" 
                                                name="quick-selection" 
                                                id="newest" 
                                                value="newest" 
                                                checked={quickPracticeSelection === "newest"} 
                                                onChange={handleQuickPracticeSelectionChange} />
                                            <label htmlFor="newest">Newest</label>
                                        </div>
                                        <div>
                                            <input 
                                                type="radio" 
                                                name="quick-selection" 
                                                id="oldest" 
                                                value="oldest" 
                                                checked={quickPracticeSelection === "oldest"} 
                                                onChange={handleQuickPracticeSelectionChange} />
                                            <label htmlFor="oldest">Oldest</label>
                                        </div>
                                    </ControlsContainer>
                                </HalfBlock>
                            </OptionsBlock>
                            <ButtonWrapper>
                                <button className="btn btn-success btn-lg">Practice {numCards} Card{numCards > 1 ? "s" : ""}</button>
                            </ButtonWrapper>
                        </QuickPractice>
                        <DividerContainer>
                            <OrContainer className="OrContainer">OR</OrContainer>
                            <hr></hr>
                        </DividerContainer>
                        <FilteredPractice>
                            <h2>Filtered Practice</h2>
                            <OptionsBlock onSubmit={handleFilteredPracticeSubmit}>
                                <HalfBlock className="HalfBlock">
                                    <p>Number of Cards</p>
                                    <p>{getFilterPassingCount()}</p>
                                </HalfBlock>
                                <HalfBlock className="HalfBlock sliders">
                                    <ControlsContainer>
                                        <label htmlFor="accuracyRate">Accuracy Rate</label>
                                        <input 
                                            type="range" 
                                            name="accuracyRate" 
                                            id="accuracyRate" 
                                            min={Math.min(...cards.map(card => card.accuracyRate))} 
                                            max={100}
                                            step={(100 - Math.min(...cards.map(card => card.accuracyRate))) / 20} 
                                            value={filters.accuracyRate}
                                            onChange={handleFilterChange}
                                        />
                                        <SliderValueDisplay>&lt;= {filters.accuracyRate}%</SliderValueDisplay>
                                        <label htmlFor="lastPracticed">Last Practiced</label>
                                        <input 
                                            type="range" 
                                            name="lastPracticed" 
                                            id="lastPracticed"
                                            min={0}
                                            max={2592000000}
                                            step={86400000}
                                            value={filters.lastPracticed}
                                            onChange={handleFilterChange}
                                        />
                                        <SliderValueDisplay>&gt;= {Math.floor(filters.lastPracticed / 86400000)} days ago</SliderValueDisplay>
                                        <label htmlFor="dateCreated">Date Created</label>
                                        <input 
                                            type="range" 
                                            name="dateCreated" 
                                            id="dateCreated"
                                            min={0}
                                            max={7776000000}
                                            step={86400000}
                                            value={filters.dateCreated}
                                            onChange={handleFilterChange}
                                        />
                                        <SliderValueDisplay>&gt;= {Math.floor(filters.dateCreated / 86400000)} days ago</SliderValueDisplay>
                                        <p>Card Type</p>
                                        <div>
                                            <input 
                                                type="checkbox" 
                                                name="flashCard" 
                                                id="flashCard"
                                                checked={filters.flashCard}
                                                onChange={handleFilterChange} />
                                            <label htmlFor="flashCard">Flash Card</label>
                                        </div>
                                        <div>
                                            <input 
                                                type="checkbox" 
                                                name="trueFalse" 
                                                id="trueFalse"
                                                checked={filters.trueFalse}
                                                onChange={handleFilterChange} />
                                            <label htmlFor="trueFalse">True/False</label>
                                        </div>
                                        <div>
                                            <input 
                                                type="checkbox" 
                                                name="multipleChoice" 
                                                id="multipleChoice"
                                                checked={filters.multipleChoice}
                                                onChange={handleFilterChange} />
                                            <label htmlFor="multipleChoice">Multiple Choice</label>
                                        </div>
                                    </ControlsContainer>
                                </HalfBlock>
                            </OptionsBlock>    
                            <ButtonWrapper>
                                <button disabled={getFilterPassingCount() === 0} className="btn btn-success btn-lg">{getFilterPassingCount() === 0 ? "No Cards Meet Criteria" : "Practice Selection"}</button>
                            </ButtonWrapper>
                        </FilteredPractice>
                    </>
                }
			</div>
		</SessionSetupFormWrapper>
  )
}

export default SessionSetupForm;