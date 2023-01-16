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
    const [deckIds, setDeckIds] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    
    const [criteria, setCriteria] = useState({
        categoryId: "",
        searchString: "",
        sort: ""
    });

    const fetchDecks = async (newCriteria) => {
        let queryString;
        if(!newCriteria) {
            console.log("no new criteria");
            queryString = new URLSearchParams({searchString: criteria.searchString, categoryId: criteria.categoryId, sort: criteria.sort, page}).toString();
        } else {
            console.log({newCriteria});
            queryString = new URLSearchParams({searchString: newCriteria.searchString, categoryId: newCriteria.categoryId, sort: newCriteria.sort, page: 1}).toString();
            console.log({queryString});
            setCriteria(newCriteria);
        }
        if(queryString.length > 0) {
            queryString = "?" + queryString;
        }
        try {
            const response = await axios.get(`${baseURL}/decks${queryString}`);
            setDeckIds(ids => newCriteria ? response.data : [...ids, ...response.data]);
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
        if(deckIds.length < 1 && !firstFetchDone.current) {
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
                <select name="sort" id="sort" onChange={handleChangeCriteria} value={criteria.sort} data-selection_type="sort" >
                    <option value="">Sort</option>
                    <option value="a-z">A-Z</option>
                    <option value="z-a">Z-A</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>
            </ControlBarWrapper>
            <StyledInfiniteScroll
                dataLength={deckIds.length}
                next={fetchDecks}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                >
                    {deckIds.map(deckId => <DeckTile key={deckId} deckId={deckId} />)}
                </StyledInfiniteScroll>
        </div>
    )
}

export default BrowseDecks;