import React from "react";
import { useDispatch, useSelector, useState } from "react-redux";
import { useNavigate } from "react-router";
import useFormInput from "../hooks/useFormInput";
import { createGroup } from "../reducers/loginSlice";
import styled from "styled-components";

const GroupFormWrapper = styled.form`
	text-align: left;
    & div {
        margin-top: .5rem;
    }
    & .form-label {
        margin-bottom: 1px;
    }
`;
	
const ButtonWrapper = styled.div`
	display: flex;
	justify-content: space-around;
	padding-top: 2.5rem;
	& button {
		// margin: 0 1.5rem;
		// @media (max-width: 330px) {
		// 	margin: 0 .75rem;
		// }
	}
	// @media (max-width: 600px) {
	// 	padding-top: 4rem;
	// }
	@media (max-width: 330px) {
		padding-top: 2rem;
	}
`;

function GroupForm() {
	const userId = useSelector((state) => state.login.userId);
    const [groupName, clearGroupNameChange, handleGroupNameChange] = useFormInput("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const createNewGroup = (evt) => {
        evt.preventDefault();
        dispatch(createGroup({creator: userId, name: groupName}))
            .then(response => {
                clearGroupNameChange();
                navigate(`/groups/${response.payload}`);
            });
    }


	const handleCancelCreateGroup = () => {
		navigate(`/dashboard`);
	}

  	return (
		<GroupFormWrapper onSubmit={createNewGroup}>
			<div>
				<label className="form-label" htmlFor="name">Group Name</label>
				<input required className="form-control" type="text" id="name" name="name" value={groupName} onChange={handleGroupNameChange} />
			</div>
			<ButtonWrapper>
				<button className="btn btn-danger" onClick={handleCancelCreateGroup}>Cancel</button>
				<button className="btn btn-primary" type="submit">Create</button>
			</ButtonWrapper>
		</GroupFormWrapper>
    )
}

export default GroupForm