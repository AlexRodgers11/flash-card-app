import { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import useFormInput from "../hooks/useFormInput";
import useToggle from "../hooks/useToggle";
import { client } from "../utils";
import Modal from "./Modal";

const FooterWrapper = styled.footer`
    display: flex;
    flex-direction: column;
    // justify-content: center;
    align-items: center;
    height: 100%;
    // padding: 1rem;
    background-color: black;
    opacity: 95%;
    color: #a3a3a3;
    @media (max-width: 500px) {
        // flex-direction: column;
        // padding-top: 1.5rem;
    }
`;

const LinksSection = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    @media (max-width: 500px) {
        flex-direction: column;
        // padding-top: 1.5rem;
    }
`;

const LinkBlock = styled.div`
    display: inline-block;
    width: 30%;
    height: 80%;
    @media (max-width: 500px) {
        margin-top: 1rem;
        width: 100%;
        // &:first-of-type h4 {
        //     padding-top: 2rem;
        // }
    }
`;

const LinkBlockHeading = styled.h4`
    color: white;
    margin-bottom: .5rem;
    @media (max-width: 500px) {
        margin-bottom: .15rem !important;
    }
`;

const ContentWrapper = styled.p`
    @media (max-width: 500px) {
        flex-direction: column;
    }
`;

const Content = styled.span.attrs({
    role: "button"
})`

`

const PartialHr = styled.hr`
    width: 85%;
`;

const BlockTextArea = styled.textarea`
    display: block;
    width: 100%;
    margin: 1rem 0;
`;

const SubjectLabel = styled.label.attrs({
    htmlFor: "subject"
})`
    margin-right: .25rem;
    font-weight: 500;
`;

const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function Footer() {
    const [showContactForm, toggleShowContactForm] = useToggle(false);
    const [subject, clearSubject, handleSubjectChange, setSubject] = useFormInput("general");
    const [message, clearMessage, handleMessageChange, setMessage] = useFormInput();
    const [bugScreenshot, setBugScreenshot] = useState();
    const userId = useSelector((state) => state.login.userId);
    
    const handleSendEmail = async (evt) => {
        evt.preventDefault();

        if(bugScreenshot) {
            const formData = new FormData();
            formData.append("bug-screenshot", bugScreenshot);
            formData.append("subject", subject === "general" ? "General" : subject === "help" ? "Help Requested" : "Bug-Screenshot");
            formData.append("messageText", message);
            await client.post(`${baseURL}/communications/send-email-to-site-admins`, formData, { headers: {"Content-Type": "multipart/form-data"}});
        } else {
            await client.post(`${baseURL}/communications/send-email-to-site-admins`, {
                subject: subject,
                messageText: message,
            });

        }
        clearSubject();
        clearMessage();
        toggleShowContactForm();
    }

    const handleCloseContactForm = () => {
        clearSubject();
        clearMessage();
        toggleShowContactForm()
    }
    
    const handlebugScreenshotChange = (evt) => {
        const file = evt.target.files[0];
        console.log({file})
        setBugScreenshot(file);
    }    



    return (
        <>
        {showContactForm && 
            <Modal hideModal={handleCloseContactForm}>
                <form onSubmit={handleSendEmail}>
                    <SubjectLabel>Subject:</SubjectLabel>
                    <select id="select" name="select" value={subject} onChange={handleSubjectChange}>
                        <option value="general">General</option>
                        <option value="help">Help Needed</option>
                        <option value="bug">Report an Issue</option>
                    </select>
                    <BlockTextArea required cols="35" rows="10" autoComplete="off" autofocus minLength={10} maxLength={5000} spellCheck={true} placeholder="Type your message here" value={message} onChange={handleMessageChange}/>
                    {subject === "bug" && 
                        <div>
                            <label htmlFor="bug-screenshot">Screenshot (optional)</label>
                            <input type="file" accept="image/*" id="bug-screenshot" name="bug-screenshot" onChange={handlebugScreenshotChange} />
                        </div>
                    }
                    <br/>
                    <button className="btn btn-success btn-md">Send</button>
                </form>
            </Modal>
        }
        <FooterWrapper className="FooterWrapper">
            <LinksSection className="LinksSection">
                <LinkBlock className="LinkBlock">
                    <LinkBlockHeading>Heading 1</LinkBlockHeading>
                    {userId && <ContentWrapper><Content onClick={toggleShowContactForm}>Contact</Content></ContentWrapper>}
                    <ContentWrapper><Content>Link 2</Content></ContentWrapper>
                    <ContentWrapper><Content>Link 3</Content></ContentWrapper>
                    <ContentWrapper><Content>Link 4</Content></ContentWrapper>
                    <ContentWrapper><Content>Link 5</Content></ContentWrapper>
                </LinkBlock>
                <LinkBlock className="LinkBlock">
                    <LinkBlockHeading>Heading 2</LinkBlockHeading>
                    <ContentWrapper><Content>Link 1</Content></ContentWrapper>
                    {/* <ContentWrapper><Content>Link 2</Content></ContentWrapper>
                    <ContentWrapper><Content>Link 3</Content></ContentWrapper> */}
                    <ContentWrapper><Content>Link 4</Content></ContentWrapper>
                    <ContentWrapper><Content>Link 5</Content></ContentWrapper>
                </LinkBlock>
                <LinkBlock className="LinkBlock">
                    <LinkBlockHeading>Heading 3</LinkBlockHeading>
                    <ContentWrapper><Content>Link 1</Content></ContentWrapper>
                    <ContentWrapper><Content>Link 2</Content></ContentWrapper>
                    <ContentWrapper><Content>Link 3</Content></ContentWrapper>
                    <ContentWrapper><Content>Link 4</Content></ContentWrapper>
                    <ContentWrapper><Content>Link 5</Content></ContentWrapper>
                </LinkBlock>
            </LinksSection>
            <PartialHr />
            <p>&copy; 2023 FlishFlash</p>
        </FooterWrapper>
        </>
    )
}

export default Footer;