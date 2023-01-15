import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicDecks } from "../reducers/decksSlice";
// import DeckList from "./DeckList";
import DeckTile from "./DeckTile";
import styled from "styled-components";
import InfiniteScroll from "react-infinite-scroller";
import useFormInput from "../hooks/useFormInput";

const baseURL = 'http://localhost:8000';

const ControlBarWrapper = styled.form`
    
`;

const DeckListWrapper = styled.div`
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
    const [page, setPage] = useState(0);
    const deckIds = useSelector((state) => state.decks.deckIds);
    
    const [criteria, setCriteria] = useState({
        category: "",
        search: "",
        sort: ""
    });

    const dispatch = useDispatch();

    const handleChangeCriteria = (evt) => {
        setCriteria({...criteria, [evt.target.dataset.selection_type]: evt.target.value});
    }

    useEffect(() => {
        console.log("in useEffect to fetch updated deck results");
        dispatch(fetchPublicDecks({searchString: criteria.search, categoryId: criteria.category, sort: criteria.sort}));
    }, [dispatch, criteria.search, criteria.category, criteria.sort]);//do I need page here?

    useEffect(() => {
        //possibly hardcode in the categories. If not use special route to only get the category names and ids
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
    
    return (
        <div>
            <ControlBarWrapper>
                <label htmlFor="search">Search for decks</label>
                <input type="text" name="search" id="search" onChange={handleChangeCriteria} value={criteria.search} data-selection_type="search" />
                {/* <label htmlFor="category">By Category</label> */}
                <select name="category" id="category" onChange={handleChangeCriteria} value={criteria.category} data-selection_type="category" >
                    <option value="">Filter By Category</option>
                    {categories.length > 0 && categories.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}
                </select>
                {/* <label htmlFor="sort">Sort</label> */}
                <select name="sort" id="sort" onChange={handleChangeCriteria} value={criteria.sort} data-selection_type="sort" >
                    <option value="">Sort</option>
                    <option value="a-z">A-Z</option>
                    <option value="z-a">Z-A</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>
            </ControlBarWrapper>   
            <DeckListWrapper>
                {deckIds.map(deckId => <DeckTile key={deckId} deckId={deckId} />)}
            </DeckListWrapper>
            {/* <DeckList listType="all" /> */}
        </div>
    )
    // const firstRender = useRef(true);
    // useEffect(() => {
    //     // if(firstRender.current) {
    //     console.log("in useEffect to fetch deck results for the first time");
    //     if(page === 0) {
    //         dispatch(fetchPublicDecks({searchString: "", categoryId: "", sort: ""}));
    //         setPage(1);
    //     }
    // }, [criteria.search, criteria.category, criteria.sort, dispatch, page]);

}

export default BrowseDecks;