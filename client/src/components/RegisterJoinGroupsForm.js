import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { fetchGroupJoinOptions } from '../reducers/groupSlice';
import { submitJoinCode } from '../reducers/loginSlice';
import { sendJoinRequest } from "../reducers/communicationsSlice";
import { addGroup } from '../reducers/loginSlice';
import { client } from '../utils';

const baseURL = "http://localhost:8000";

function RegisterJoinGroupsForm(props) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userId = useSelector((state) => state.login.userId);
    const [foundGroups, setFoundGroups] = useState([]);
    const [searchField, setSearchField] = useState("");
    const [displayNoResults, setDisplayNoResults] = useState(false);
    const [joinAttemptType, setJoinAttemptType] = useState("");
    const groupJoinOptions = useSelector((state) => state.group.joinOptions);
    const [content, setContent] = useState("search");
    const [userEnteredJoinCode, clearUserEnteredJoinCode, handleChangeUserEnteredJoinCode, setUserEnteredJoinCode] = useFormInput("");
    const [selectedGroupId, setSelectedGroupId] = useState("");
    
    const continueSearching = () => {
        if(userEnteredJoinCode) {
            clearUserEnteredJoinCode();
        }
        setContent("search");
    }

    const handleSubmit = evt => {
        evt.preventDefault();
        if(!foundGroups.length) {
            setDisplayNoResults(true);
        }
    }

    const goToDashboard = () => {
        navigate("/dashboard");
    }

    const handleSearchInputChange = evt => {
        if(displayNoResults) {
            setDisplayNoResults(false);
        }
        setSearchField(evt.target.value);
    }
    
    const selectGroup = (evt) => {
        dispatch(fetchGroupJoinOptions({groupId: evt.target.dataset.id}));
        setContent("join-options");
        setSelectedGroupId(evt.target.dataset.id);
    }

    const joinGroup = (evt) => {
        evt.preventDefault();
        dispatch(submitJoinCode({userId, groupId: selectedGroupId, joinCode: userEnteredJoinCode}))
        .then(result => {
            if(result.payload) {
                setContent("success");
                setJoinAttemptType("code");                
            } else {
                setContent("failure");
                setUserEnteredJoinCode("");
            }
        })
        .catch(err => {
            setContent("");
            console.error(err);
        });
    }

    const sendRequestToJoin = () => {
        dispatch(sendJoinRequest({groupId: selectedGroupId}))
        .then(result => {
            if(result.meta.requestStatus === "fulfilled") {
                setContent("success");
                setJoinAttemptType("request");
            }
        })
        .catch(err => {
            setContent("");
            console.error(err);
        });
    }

    useEffect(() => {
        if(!userId) {
            navigate("/");
        }
    }, [navigate, userId]);

    const displayJoinOptions = () => {
        switch(groupJoinOptions) {
            case "invite":
                return (
                    <>
                        <p>A user can only become a member of this group by receiving an invite</p>
                        <button onClick={continueSearching}>Search for More Groups</button>
                        <button onClick={goToDashboard}>Add groups later</button>
                    </>
                );
            case "request": 
                return (
                    <>
                        <p>To join this group you must submit a request to its administrators</p>
                        <button onClick={sendRequestToJoin}>Request to Join</button>
                        {content === "failure" && <p style={{color: "red", fontSize: "1.1em", fontWeight: "600"}}>Incorrect code entered</p>}
                        <button onClick={continueSearching}>Cancel</button>
                    </>
                )
            case "code":
                return (
                    <>
                        <form autoComplete='off' onSubmit={joinGroup}>
                            <label htmlFor="join-code-entry-one">Enter the group's code to join</label>
                            <input type="text" id="join-code-entry-one" name="join-code-entry-one" onChange={handleChangeUserEnteredJoinCode} value={userEnteredJoinCode} />
                            <button type="submit" onClick={joinGroup}>Submit</button>
                            <button onClick={continueSearching}>Cancel</button>
                        </form>
                    </>
                )
            case "code-and-request":
                return (
                    <>
                        <p>To join this group you can either enter the group's join code or send a request to its administrators</p>
                        <form autoComplete='off' onSubmit={joinGroup}>
                            <label htmlFor="join-code-entry-two">Enter the group's code to join</label>
                            <input id="join-code-entry-two" name="join-code-entry-two" type="text" onChange={handleChangeUserEnteredJoinCode} value={userEnteredJoinCode} />
                            <button type="submit" onClick={joinGroup}>Submit</button>
                            {content === "failure" && <p style={{color: "red", fontSize: "1.1em", fontWeight: "600"}}>Incorrect code entered</p>}
                        </form>
                        <button onClick={sendRequestToJoin}>Send Request to Join</button>
                        <button onClick={continueSearching}>Cancel</button>
                    </>
                );
            default: 
                return (
                    <>
                        <p>An error occurred</p>
                        <button onClick={continueSearching}>Search for More Groups</button>
                        <button onClick={goToDashboard}>Add groups later</button>
                    </>
                )
        }
    }
    
    useEffect(() => {
        if(searchField.length >= 3) {
            client.get(`${baseURL}/groups/search?entry=${searchField}`)
                .then((response) => setFoundGroups(response.data))
                .catch(err => console.log(err));
        } else {
            setFoundGroups([]);
        }
    }, [displayNoResults, searchField]);

    return (
        <div>
            {content === "search" ?
                <>
                <form autoComplete='off' onSubmit={handleSubmit}>
                    <label htmlFor="searchField">Search for groups to join</label>
                    <input type="text" name="searchField" id="searchField" value={searchField} onChange={handleSearchInputChange} />
                    <button type="submit">Search</button>
                </form>
                {displayNoResults && <p>No groups found</p>}
                {/* need to make sure groups already member of or have sent request to don't show up here */}
                {foundGroups.map((group) => <button data-id={group._id} key={group._id} onClick={selectGroup}>{group.name}</button>)}
                <button onClick={props.hideModal ? props.hideModal : goToDashboard}>{joinAttemptType || props.hideModal ? props.hideModal ? 'Done' : 'Finish Registration' : 'Skip for now'}</button>
                </>
                :
                <>
                {content === "join-options" ? 
                    <div>
                        {displayJoinOptions()}
                    </div>
                    :
                    content === "success" ? 
                        <div>
                            <p>Success! {joinAttemptType === "code" ? "You are now a member of this group" : "Your request has been sent to the group's administrators"}</p>
                            <button onClick={continueSearching}>Search for more groups</button>
                            <button onClick={props.hideModal ? props.hideModal : goToDashboard}>Done</button>
                        </div>
                        :
                        <div>
                            {displayJoinOptions()}
                        </div>
                    
                }
                </>
            }
        </div>
    )
}

export default RegisterJoinGroupsForm