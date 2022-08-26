import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { setGroups } from '../reducers/loginSlice';

function RegisterJoinGroupsForm() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [foundGroups, setFoundGroups] = useState([]);
    const [searchField, setSearchField] = useState("");
    const [displayNoResults, setDisplayNoResults] = useState(false);

    const addGroup = evt => {
        if(selectedGroups.indexOf(foundGroups[evt.target.value]) === -1) {
            setSelectedGroups(groups => [...groups, foundGroups[evt.target.value]]);
        } else {
            alert("you've already added this group");
        }
    }
    
    const handleSubmit = evt => {
        evt.preventDefault();
        if(!foundGroups.length) {
            setDisplayNoResults(true);
        }
    }

    const saveGroups = () => {
        dispatch(setGroups(selectedGroups.map(group => group._id)));
    }

    const skip = () => {
        navigate("/register");
    }

    const handleSearchInputChange = evt => {
        console.dir(evt);
        if(displayNoResults) {
            setDisplayNoResults(false);
        }
        setSearchField(evt.target.value);
    }
    
    useEffect(() => {
        if(searchField.length >= 3) {
            // console.log("should be sending request");
            const baseURL = "http://localhost:8000";
            axios.get(`${baseURL}/groups?search=${searchField}`)
                .then((response) => setFoundGroups(response.data))
                .catch(err => console.log(err));
        } else {
            setFoundGroups([]);
        }
    }, [displayNoResults, searchField]);

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="searchField">Search for groups to join</label>
                <input type="text" name="searchField" id="searchField" value={searchField} onChange={handleSearchInputChange} />
                {displayNoResults && <p>No groups found</p>}
                <button type="submit">Search</button>
            </form>
            {foundGroups.map((group, idx) => <button key={group._id} value={idx} onClick={addGroup}>{group.name}</button>)}
            {selectedGroups.length > 0 && <h1>Send join requests to these groups</h1>}
            {selectedGroups.map(group => <span key={group._id}>{group.name}</span>)}
            <button onClick={saveGroups}>Submit</button>
            <button onClick={skip}>Skip for now</button>
        </div>
    )
}

export default RegisterJoinGroupsForm