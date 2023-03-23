import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import styled from "styled-components"
import GroupDecksSection from "./GroupDecksSection";
import GroupMemberList from "./GroupMemberList";
import { JoinOptionContainer } from "./StyledComponents/GroupStyles";
import { generateJoinCode } from '../utils';
import useToggle from "../hooks/useToggle";
import { updateGroup } from "../reducers/groupSlice";
import { BsClipboardPlus } from "react-icons/bs";

const GroupAdminSectionWrapper = styled.section`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const CopyButton = styled.button`
    display: inline-flex;
    align-items: center;
    & svg {
        margin-left: .25rem;
    }
`;

const GroupEditControlsContainer = styled.div`

`;

const JoinCodeContainer = styled.div`

`;

export function GroupAdminSection() {
    const userId = useSelector((state) => state.login.userId);
    const groupId = useSelector((state) => state.group.groupId);
    const administrators = useSelector((state) => state.group.administrators);
    const joinOptions = useSelector((state) => state.group.joinOptions);
    const joinCode = useSelector((state) => state.group.joinCode);//need to figure out how to make sure only admins can see this
    const [joinCodeVisible, toggleJoinCodeVisible] = useToggle(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if(administrators.length && !administrators.includes(userId)) {
            navigate("/dashboard");
        }
    }, [administrators, userId, navigate]);

    const handleChangeJoinOptions = (evt) => {
        let newJoinCode;
        if(evt.target.value === "code" || evt.target.value === "code-and-request") {
            if(joinOptions !== "code" && joinOptions !== "code-and-request") {
                newJoinCode = generateJoinCode();
                toggleJoinCodeVisible();
                dispatch(updateGroup({groupId, groupUpdates:{joinOptions: evt.target.value, joinCode: newJoinCode}}));
            } else {
                dispatch(updateGroup({groupId, groupUpdates: {joinOptions: evt.target.value}}));
            }
        } else {
            newJoinCode = "";
            if(joinCodeVisible) {
                toggleJoinCodeVisible();
            }
            dispatch(updateGroup({groupId, groupUpdates:{joinOptions: evt.target.value, joinCode: newJoinCode}}));
        }
    }

    const getNewJoinCode = () => {
        const newJoinCode = generateJoinCode();
        dispatch(updateGroup({groupId, groupUpdates: {joinCode: newJoinCode}}));
    }

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(joinCode);
        } catch (err) {
            console.error("Failed to copy text:", err.message)
        }
    }

    return (
        <GroupAdminSectionWrapper>
            <GroupEditControlsContainer>
                {/* {userId === administrators[0] && */}
                    <JoinOptionContainer>
                        <label htmlFor="join-code-options">Select how new members can join:</label>
                        <select id="join-code-options" name="join-code-options" onChange={handleChangeJoinOptions}>
                            <option selected={joinOptions === "invite"} value="invite">Invite Only</option>
                            <option selected={joinOptions === "code"} value="code">Join Code</option>
                            <option selected={joinOptions === "request"} value="request">Request by User</option>
                            <option selected={joinOptions === "code-and-request"} value="code-and-request">Join Code and Request by User</option>
                        </select>
                        <JoinCodeContainer>
                            {!joinCodeVisible ? 
                                <button onClick={toggleJoinCodeVisible}>Show Group Join Code</button>
                                :
                                <div>
                                    <span>Join Code: {joinCode} </span>
                                    <CopyButton onClick={copyCode}>Copy Code <BsClipboardPlus /></CopyButton>
                                    <button onClick={getNewJoinCode}>Get New Code</button>
                                    <button onClick={toggleJoinCodeVisible}>Hide Join Code</button>
                                </div>
                            }
                        </JoinCodeContainer>
                    </JoinOptionContainer>
                {/* } */}
            </GroupEditControlsContainer>
            <GroupMemberList editMode={true} listType="members" extraStyling={true}/>
            <GroupDecksSection></GroupDecksSection>
        </GroupAdminSectionWrapper>
    )
}