import { useEffect, useState } from "react";
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
import { MdGroupAdd } from "react-icons/md";
import Modal from "./Modal";
import useFormInput from "../hooks/useFormInput";
import { inviteUserToGroup } from "../reducers/communicationsSlice";

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

const EmailInput = styled.input.attrs({
    placeholder: "futuregroupmember@example.com",
    type: "email"
})`
    min-width: 17rem;
    margin-top: 1rem;
`;

const BlockTextArea = styled.textarea`
    display: block;
    width: 80%;
    margin: 1rem 0;
`;

const InvitationForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: start;
`;

const CenteredButtonGroup = styled.div`
    align-self: center;
`;

export function GroupAdminSection() {
    const userId = useSelector((state) => state.login.userId);
    const groupId = useSelector((state) => state.group.groupId);
    const groupName = useSelector((state) => state.group.name);
    const administrators = useSelector((state) => state.group.administrators);
    const joinOptions = useSelector((state) => state.group.joinOptions);
    const joinCode = useSelector((state) => state.group.joinCode);//need to figure out how to make sure only admins can see this
    const [joinCodeVisible, toggleJoinCodeVisible] = useToggle(false);
    const [showInviteModal, toggleShowInviteModal] = useToggle(false);
    const [emailInput, clearEmailInput, handleEmailInputChange, setEmailInput] 
    = useFormInput("");
    const [comment, clearComment, handleCommentChange, setComment] = useFormInput("");
    const [showMessageSent, toggleShowMessageSent] = useToggle(false);
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

    const handleCloseModal = () => {
        toggleShowInviteModal();
        clearEmailInput();
        clearComment();
        if(showMessageSent) {
            toggleShowMessageSent();
        }
    }

    const handleSubmit = (evt) => {
        evt.preventDefault();
        dispatch(inviteUserToGroup({groupId, email: emailInput, comment}))
            .then(() => {
                toggleShowMessageSent();
                clearEmailInput();
                clearComment();
            });
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
            {showInviteModal && 
                <Modal hideModal={handleCloseModal}>
                    {!showMessageSent &&
                        <InvitationForm onSubmit={handleSubmit}>
                            <div><label htmlFor="email"><h5>Type the email of the user you want to invite to {groupName}</h5></label></div>
                            <EmailInput name="email" id="email" value={emailInput} onChange={handleEmailInputChange}/>
                            <BlockTextArea placeholder="Comments (Optional)" value={comment} onChange={handleCommentChange}/>
                            <CenteredButtonGroup>
                                <button className="btn btn-danger btn-md" onClick={toggleShowInviteModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-md">Send</button>
                            </CenteredButtonGroup>
                        </InvitationForm>
                    }
                    {showMessageSent &&
                        <div>
                            <p>Success. If {emailInput} is an existing user they should receive invitation shortly</p>
                            <button className="btn btn-primary btn-md" onClick={handleCloseModal}>Ok</button>
                        </div>
                    }
                </Modal>
            }
            <GroupEditControlsContainer>
                <JoinOptionContainer>
                    <label htmlFor="join-code-options">Select how new members can join:</label>
                    <select id="join-code-options" name="join-code-options" onChange={handleChangeJoinOptions}>
                        <option selected={joinOptions === "invite"} value="invite">Invite Only</option>
                        <option selected={joinOptions === "code"} value="code">Join Code</option>
                        <option selected={joinOptions === "request"} value="request">Request by User</option>
                        <option selected={joinOptions === "code-and-request"} value="code-and-request">Join Code and Request by User</option>
                    </select>
                    <button onClick={toggleShowInviteModal} className="btn btn-primary btn-sm"><MdGroupAdd /> Invite</button>
                    {(joinOptions === "code" || joinOptions === "code-and-request") &&
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
                    }
                </JoinOptionContainer>
            </GroupEditControlsContainer>
            <GroupMemberList editMode={true} listType="members" extraStyling={true}/>
            <GroupDecksSection></GroupDecksSection>
        </GroupAdminSectionWrapper>
    )
}