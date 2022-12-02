import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useFormInput from "../hooks/useFormInput";
import { fetchPublicDecks } from "../reducers/decksSlice";

const baseURL = 'http://localhost:8000';

function BrowseControlBar() {
    const [categories, setCategories] = useState([]);
    const [selectionOptions, setSelectionOptions] = useState({
        category: "",
        search: "",
        sort: ""
    });
    const dispatch = useDispatch();

    const handleChangeSelectionOptions = (evt) => {
        setSelectionOptions({...selectionOptions, [evt.target.dataset.selection_type]: evt.target.value});
    }

    useEffect(() => {
        dispatch(fetchPublicDecks({searchString: selectionOptions.search, categoryId: selectionOptions.category, sort:selectionOptions.sort}));
    }, [dispatch, selectionOptions]);

    useEffect(() => {
        //possibly hardcode in the categories. If not use special route to only get the category names and ids
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
        <form>
            <label htmlFor="search">Search for decks</label>
            <input type="text" name="search" id="search" onChange={handleChangeSelectionOptions} value={selectionOptions.search} data-selection_type="search" />
            <label htmlFor="category">By Category</label>
            <select name="category" id="category" onChange={handleChangeSelectionOptions} value={selectionOptions.category} data-selection_type="category" >
                <option value="">Filter By Category</option>
                {categories.length > 0 && categories.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
            <label htmlFor="sort">Sort</label>
            <select name="sort" id="sort" onChange={handleChangeSelectionOptions} value={selectionOptions.sort} data-selection_type="sort" >
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
            </select>
        </form>
    )
}

export default BrowseControlBar;