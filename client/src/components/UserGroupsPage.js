import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { createGroup } from '../reducers/loginSlice';
import RegisterJoinGroupsForm from "./RegisterJoinGroupsForm";
import GroupTile from "./GroupTile";
import useFormInput from "../hooks/useFormInput";
import Modal from "./Modal";

function UserGroupsPage() {
    const { userId } = useParams(); 
    const [groupName, clearGroupNameChange, handleGroupNameChange] = useFormInput("");
    const [modalContent, setModalContent] = useState("");
    const groups = useSelector((state) => state.login.groups);
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
    
    return (
        <div>
            <div data-form="create" onClick={selectForm} style={{display: "inline-block", textDecoration: "none", color:"inherit", margin: "5em 1em", padding: ".5em 1em", border: "1px solid black", cursor: "pointer"}}>Create New Group</div>
            <div data-form="search" onClick={selectForm} style={{display: "inline-block", textDecoration: "none", color:"inherit", margin: "5em 1em", padding: ".5em 1em", border: "1px solid black", cursor: "pointer"}}>Search for New Groups to Join</div>
            {/* <GroupList groupIds={user.groups} /> */}
            <div>
                {groups.map(groupId => <GroupTile key={groupId} groupId={groupId}/>)}
            </div>
            {!modalContent ?
                null
                :
                <Modal hideModal={hideModal}>
                    {displayModalContent()}
                </Modal>
            } 
        </div>
    );
}

export default UserGroupsPage;