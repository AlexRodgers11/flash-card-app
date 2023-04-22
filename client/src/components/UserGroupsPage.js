import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { createGroup, fetchLoggedInUserData } from '../reducers/loginSlice';
import BackButton from "./BackButton";
import RegisterJoinGroupsForm from "./RegisterJoinGroupsForm";
import GroupTile from "./GroupTile";
import useFormInput from "../hooks/useFormInput";
import Modal from "./Modal";
import styled from "styled-components";
import { EmptyIndicator } from "./StyledComponents/EmptyIndicator";

const UserGroupsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #FF6565;
    min-height: calc(100vh - 5.5rem);
    & button {
        background-color: white;
    }
`;

const GroupTilesContainer = styled.div`
    width: 80%;
    max-width: 1250px;
    align-items: center;
`;

const StyledButton = styled.button`
    display: inline-block;
    margin: 4rem 1rem 3rem 1rem;
    width: 14rem;
    height: 5rem;
    border-radius: 1rem;
`;

function UserGroupsPage() {
    const { userId } = useParams(); 
    const [groupName, clearGroupNameChange, handleGroupNameChange] = useFormInput("");
    const [modalContent, setModalContent] = useState("");
    const groups = useSelector((state) => state.login.groups);
    const messageCount = useSelector((state) => state.communications.messages.received.length);
    const notificationCount = useSelector((state) => state.communications.notifications.length);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const createNewGroup = (evt) => {
        evt.preventDefault();
        dispatch(createGroup({creator: userId, name: groupName}))
            .then(response => {
                clearGroupNameChange();
                setModalContent("");
                navigate(`/groups/${response.payload}`);
            });
    }
    
    const displayModalContent = () => {
        if(modalContent === "search") {
            return <RegisterJoinGroupsForm hideModal={hideModal}/>
        } else if (modalContent === "create") {
            return (
                <form onSubmit={createNewGroup}>
                    <label htmlFor="group-name">Group Name</label>
                    <input type="text" id="group-name" name="group-name" value={groupName} onChange={handleGroupNameChange} />
                    <button type="submit">Create</button>
                </form>
            )
        } else {
            return 
        }
    }

    const hideModal = () => {
        setModalContent("");
    }

    const selectForm = (evt) => {
        setModalContent(evt.target.dataset.form);
    }

    const firstRender = useRef(true);
    useEffect(() => {
        if(!firstRender.current) {
            dispatch(fetchLoggedInUserData(userId));
        } else {
            firstRender.current = false;
        }
    }, [dispatch, userId, messageCount, notificationCount]);
    
    return (
        <UserGroupsWrapper>
            <BackButton className="btn btn-md" route="/dashboard" >Dashboard</BackButton>
            <div>
                <StyledButton data-form="create" onClick={selectForm} >Create New Group</StyledButton>
                <StyledButton data-form="search" onClick={selectForm} >Search for Groups to Join</StyledButton>
            </div>
            <GroupTilesContainer className="GroupTilesContainer">
                {groups.map(groupId => <GroupTile key={groupId} groupId={groupId}/>)}
            </GroupTilesContainer>
            {!groups.length && <EmptyIndicator>You aren't in any groups yet</EmptyIndicator>}
            {modalContent &&
                <Modal hideModal={hideModal}>
                    {displayModalContent()}
                </Modal>
            } 
        </UserGroupsWrapper>
    );
}

export default UserGroupsPage;