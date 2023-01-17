import React, { useEffect, useRef, useState } from "react";
import DeckTile from "./DeckTile";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import styled from "styled-components";

const baseURL = 'http://localhost:8000';

const ControlBarWrapper = styled.form`
        
`;

const StyledInfiniteScroll = styled(InfiniteScroll)`
    min-width: 350px;
    display: grid;
    place-items: center;


    grid-template-columns: repeat(1, 1fr);
    
    @media (min-width: 515px) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 740px) {
        grid-template-columns: repeat(3, 1fr);
    }
    
    @media (min-width: 960px) {
        grid-template-columns: repeat(4, 1fr);
    }
    
    
    @media (min-width: 1310px) {
        grid-template-columns: repeat(5, 1fr)
    }

    @media (min-width: 1600px) {
        grid-template-columns: repeat(6, 1fr);
    }
`

function BrowseDecks() {
    const [categories, setCategories] = useState([]);
    const [decks, setDecks] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    
    const [criteria, setCriteria] = useState({
        categoryId: "",
        searchString: "",
        // sort: ""
    });

    const [sort, setSort] = useState("");

    const handleSortChange = evt => {
        console.log("In handle sort change");
        switch(evt.target.value) {
            case "a-z":
                console.log("a-z");
                setDecks(decks.slice().sort((a, b) => {
                    if(a.deckName < b.deckName) {
                        return -1;
                    } else if(a.deckName > b.deckName) {
                        return 1;
                    } else {
                        return 0;
                    }
                }));
                break;
            case "z-a": 
                console.log("z-a");
                setDecks(decks.slice().sort((a, b) => {
                    if(a.deckName > b.deckName) {
                        return -1;
                    } else if(a.deckName < b.deckName) {
                        return 1;
                    } else {
                        return 0;
                    }
                }));
                break;
            case "card-count-up": 
                console.log("card-count-up");
                setDecks(decks.slice().sort((a, b) => {
                    if(a.cardCount > b.cardCount) {
                        return -1;
                    } else if(a.cardCount < b.cardCount) {
                        return 1;
                    } else {
                        return 0;
                    }
                }));
                break;
            case "card-count-down": 
                console.log("card-count-down");
                setDecks(decks.slice().sort((a, b) => {
                    if(a.cardCount < b.cardCount) {
                        return -1;
                    } else if(a.cardCount > b.cardCount) {
                        return 1;
                    } else {
                        return 0;
                    }
                }));
                break;
            case "newest":
                console.log("newest");
                setDecks(decks.slice().sort((a, b) => {
                    let aDate = new Date(a.dateCreated);
                    let bDate = new Date(b.dateCreated);
                    if(aDate < bDate) {
                        return -1;
                    } else if(aDate > bDate) {
                        return 1;
                    } else {
                        return 0;
                    }
                }));
                break;
            case "oldest":
                console.log("oldest");
                setDecks(decks.slice().sort((a, b) => {
                    let aDate = new Date(a.dateCreated);
                    let bDate = new Date(b.dateCreated);
                    if(aDate > bDate) {
                        return -1;
                    } else if(aDate < bDate) {
                        return 1;
                    } else {
                        return 0;
                    }
                }));
                break;
            default: 
                break;
        }
        setSort(evt.target.value);
    }
    
    const fetchDecks = async (newCriteria) => {
        let queryString;
        if(!newCriteria) {
            queryString = new URLSearchParams({searchString: criteria.searchString, categoryId: criteria.categoryId, page}).toString();
        } else {
            queryString = new URLSearchParams({searchString: newCriteria.searchString, categoryId: newCriteria.categoryId, page: 1}).toString();
            console.log({queryString});
            setCriteria(newCriteria);
        }
        if(queryString.length > 0) {
            queryString = "?" + queryString;
        }
        try {
            const response = await axios.get(`${baseURL}/decks${queryString}`);
            setDecks(decks => newCriteria ? response.data : [...decks, ...response.data]);
            setPage(page => newCriteria ? 1 : page + 1);
            setHasMore(response.data.length === 25)
        } catch(err) {
            console.error(err.message);
        }
    };

    const handleChangeCriteria = async (evt) => {
        fetchDecks({...criteria, [evt.target.dataset.selection_type]: evt.target.value});
    }
    
    
    useEffect(() => {
        console.log("in useEffect to get category list for dropdown");
        if(!categories.length) {
            axios.get(`${baseURL}/categories`)
            .then(categories => {
                    setCategories(categories.data);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [categories.length]);

    const firstFetchDone = useRef(false);
    
    useEffect(() => {
        if(decks.length < 1 && !firstFetchDone.current) {
            console.log("this should make first pull");
            fetchDecks();
            firstFetchDone.current = true;
        }
    });

    return (
        <div>
            <ControlBarWrapper>
                <label htmlFor="search">Search for decks</label>
                <input type="text" name="searchString" id="searchString" onChange={handleChangeCriteria} value={criteria.search} data-selection_type="searchString" />
                <select name="category" id="category" onChange={handleChangeCriteria} value={criteria.categoryId} data-selection_type="categoryId" >
                    <option value="">Filter By Category</option>
                    {categories.length > 0 && categories.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}
                </select>
                <select name="sort" id="sort" onChange={handleSortChange} value={sort} >
                    <option value="">Sort</option>
                    <option value="a-z">A-Z</option>
                    <option value="z-a">Z-A</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="card-count-up">Most Cards</option>
                    <option value="card-count-down">Least Cards</option>
                </select>
            </ControlBarWrapper>
            <StyledInfiniteScroll
                dataLength={decks.length}
                next={fetchDecks}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                >
                    {decks.map(deck => <DeckTile key={deck.deckId} deckId={deck.deckId} />)}
            </StyledInfiniteScroll>
        </div>
    )
}

export default BrowseDecks;