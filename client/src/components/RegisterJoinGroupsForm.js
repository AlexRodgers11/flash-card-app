import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import useFormInput from '../hooks/useFormInput';
import { fetchGroupJoinOptions } from '../reducers/groupSlice';
import { submitJoinCode } from '../reducers/loginSlice';
import { sendJoinRequest } from "../reducers/communicationsSlice";
import { client } from '../utils';
import styled from 'styled-components';
import { HiUserGroup } from "react-icons/hi";



const RegisterJoinGroupsFormWrapper = styled.div`
    text-align: left;
`;

const StyledForm = styled.form`
    & input {
        min-width: 275px;
    }
`;

const ButtonContainer = styled.div`
    text-align: center;
    margin-top: 1rem;

    width: 100%;
    & button.btn-success {
        margin-top: 2.5rem;
    }
    & button {
        margin-left: .5rem;
        margin-right: .5rem;
    }
`;

const InputButton = styled.button`
    margin-top: .125rem;
`;

const StyledHiUserGroup = styled(HiUserGroup)`
    align-self: center;
    position: absolute;
    left: .5rem;
    height: 1.25rem;
    width: 1.25rem;
`;

const GroupName = styled.p.attrs({
    role: "button"
})`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: black;
    border: 1px solid black;
    color: white;
    border-radius: .375rem;
    padding: .25rem 0;
    margin: .125rem 0;
    &:hover {
        background-color: white;
        color: black;
    }
    &:first-of-type {
        margin-top: .75rem;
    }
    & span {
        display: block;
    }
`;

const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

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
        dispatch(fetchGroupJoinOptions({groupId: evt.currentTarget.dataset.id}));
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
                        <h5>To join this group you must submit a request to its administrators</h5>
                        <ButtonContainer>
                            <button className="btn btn-primary" onClick={sendRequestToJoin}>Request to Join</button>
                            {content === "failure" && <p style={{color: "red", fontSize: "1.1em", fontWeight: "600"}}>Incorrect code entered</p>}
                            <button className="btn btn-danger" onClick={continueSearching}>Cancel</button>
                        </ButtonContainer>
                    </>
                )
            case "code":
                return (
                    <>
                        <StyledForm autoComplete='off' onSubmit={joinGroup}>
                            <label className="form-label" htmlFor="join-code-entry-one">Enter the group's code to join</label>
                            <input className="form-control" type="text" id="join-code-entry-one" name="join-code-entry-one" onChange={handleChangeUserEnteredJoinCode} value={userEnteredJoinCode} />
                            <ButtonContainer>
                                <button className="btn btn-primary" type="submit">Submit</button>
                                <button className="btn btn-danger" onClick={continueSearching}>Cancel</button>
                            </ButtonContainer>
                        </StyledForm>
                    </>
                )
            case "code-and-request":
                return (
                    <>
                        <h5>To join this group you can either enter the group's join code or send a request to its administrators</h5>
                        <br />
                        <StyledForm autoComplete='off' onSubmit={joinGroup}>
                            <label className="form-label" htmlFor="join-code-entry-two">Enter the group's code to join</label>
                            <input className="form-control" id="join-code-entry-two" name="join-code-entry-two" type="text" onChange={handleChangeUserEnteredJoinCode} value={userEnteredJoinCode} />
                                <InputButton className="btn btn-primary" type="submit" onClick={joinGroup}>Submit</InputButton>
                            {content === "failure" && <p style={{color: "red", fontSize: "1.1em", fontWeight: "600"}}>Incorrect code entered</p>}
                        </StyledForm>
                        <ButtonContainer>
                            <button className="btn btn-primary" onClick={sendRequestToJoin}>Send Request to Join</button>
                            <button className="btn btn-danger" onClick={continueSearching}>Cancel</button>
                        </ButtonContainer>
                    </>
                );
            default: 
                return (
                    <>
                        <p>An error occurred</p>
                        <ButtonContainer>
                            <button className="btn btn-primary" onClick={continueSearching}>Search for More Groups</button>
                            <button className="btn btn-danger" onClick={goToDashboard}>Add groups later</button>
                        </ButtonContainer>
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
        <RegisterJoinGroupsFormWrapper>
            {content === "search" ?
                <>
                <StyledForm autoComplete="off" onSubmit={handleSubmit}>
                    <label className="form-label" htmlFor="searchField">Search for groups to join</label>
                    <input className="form-control" type="text" name="searchField" id="searchField" value={searchField} onChange={handleSearchInputChange} />
                    <ButtonContainer>
                        <button className="btn btn-primary" type="submit">Search</button>
                    </ButtonContainer>
                </StyledForm>
                {displayNoResults && <p>No groups found</p>}
                {/* need to make sure groups already member of or have sent request to don't show up here */}
                {foundGroups.map((group) => <GroupName role="button" data-id={group._id} key={group._id} onClick={selectGroup}><StyledHiUserGroup /><span>{group.name}</span></GroupName>)}
                <ButtonContainer>
                    <button className="btn btn-success" onClick={props.hideModal ? props.hideModal : goToDashboard}>{joinAttemptType || props.hideModal ? props.hideModal ? 'Done' : 'Finish Registration' : 'Skip for now'}</button>
                </ButtonContainer>
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
                            <h5>Success! {joinAttemptType === "code" ? "You are now a member of this group" : "Your request has been sent to the group's administrators"}</h5>
                            <ButtonContainer>
                                <button className="btn btn-primary" onClick={continueSearching}>Search for more groups</button>
                                <button className="btn btn-danger" onClick={props.hideModal ? props.hideModal : goToDashboard}>Done</button>
                            </ButtonContainer>
                        </div>
                        :
                        <div>
                            {displayJoinOptions()}
                        </div>
                    
                }
                </>
            }
        </RegisterJoinGroupsFormWrapper>
    )
}

export default RegisterJoinGroupsForm