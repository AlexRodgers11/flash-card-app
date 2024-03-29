import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLoggedInUserData } from '../reducers/loginSlice';
import BackButton from "./BackButton";
import RegisterJoinGroupsForm from "./RegisterJoinGroupsForm";
import GroupTile from "./GroupTile";
import Modal from "./Modal";
import styled from "styled-components";
import { EmptyIndicator } from "./StyledComponents/EmptyIndicator";
import GroupForm from "./GroupForm";

const UserGroupsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #FF6565;
    min-height: calc(100vh - 5.5rem);

`;

const GroupTilesContainer = styled.div`
    width: 80%;
    @media (max-width: 500px) {
        width: 95%;
    }
    max-width: 1250px;
    align-items: center;
`;

const ButtonRow = styled.div`
    width: 80%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const StyledButton = styled.button`
    display: inline-block;
    margin: 4rem 1rem 3rem 1rem;
    border: 2px solid black;
    width: 45%;
    max-width: 14rem;
    height: 5rem;
    @media (max-width: 500px) {
        margin: 2rem .5rem 1.5rem .5rem; 
        height: 4rem;
    }
    border-radius: 1rem;
    &:hover {
        background-color: black;
        color: white;
        border-color: grey;
    }
`;

function UserGroupsPage() {
    const userId = useSelector((state) => state.login.userId);
    const [modalContent, setModalContent] = useState("");
    const groups = useSelector((state) => state.login.groups);
    const messageCount = useSelector((state) => state.communications.messages.received.length);
    const notificationCount = useSelector((state) => state.communications.notifications.length);
    const dispatch = useDispatch();

    const displayModalContent = () => {
        if(modalContent === "search") {
            return <RegisterJoinGroupsForm hideModal={hideModal}/>
        } else if (modalContent === "create") {
            return (
                <GroupForm />
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
        if(firstRender.current) {
            firstRender.current = false;
            dispatch(fetchLoggedInUserData(userId));
        }
    }, [dispatch, userId, messageCount, notificationCount]);
    
    return (
        <UserGroupsWrapper>
            <BackButton className="btn btn-md" route="/dashboard" >Dashboard</BackButton>
            <ButtonRow>
                <StyledButton data-form="create" onClick={selectForm} >Create New Group</StyledButton>
                <StyledButton data-form="search" onClick={selectForm} >Search for Groups to Join</StyledButton>
            </ButtonRow>
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