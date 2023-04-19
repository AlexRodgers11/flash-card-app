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
    align-items: center;
    background-color: black;
    opacity: 95%;
    color: #a3a3a3;
`;

const LinksSection = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: center;
    align-items: start;
    padding: 1.5rem;
    @media (max-width: 500px) {
        flex-direction: column;
    }
`;

const LinkBlock = styled.div`
    display: inline-block;
    width: 30%;
    @media (max-width: 500px) {
        margin-top: 1rem;
        width: 100%;
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
    &:hover {
        color: #7d7d7d;
    }
`

const Copyright = styled.p`
    padding-bottom: 2rem;
`;

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
            formData.append("subject", subject === "general" ? "General" : subject === "help" ? "Help Requested" : "Report Bug");
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

    const handleShowBugForm = () => {
        setSubject("bug");
        toggleShowContactForm();
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
                    <LinkBlockHeading>Company</LinkBlockHeading>
                    <ContentWrapper><Content>About</Content></ContentWrapper>
                    {userId && <ContentWrapper><Content onClick={toggleShowContactForm}>Contact</Content></ContentWrapper>}
                    <ContentWrapper><Content>Hire Me</Content></ContentWrapper>
                </LinkBlock>
                <LinkBlock className="LinkBlock">
                    <LinkBlockHeading>Resources</LinkBlockHeading>
                    <ContentWrapper><Content>Docs</Content></ContentWrapper>
                    <ContentWrapper><Content>Pricing</Content></ContentWrapper>
                    <ContentWrapper><Content onClick={handleShowBugForm}>Report Bug</Content></ContentWrapper>
                </LinkBlock>
                <LinkBlock className="LinkBlock">
                    <LinkBlockHeading>Policies & Preferences</LinkBlockHeading>
                    <ContentWrapper><Content>Privacy Policy</Content></ContentWrapper>
                    <ContentWrapper><Content><a href="/cookie-policy" target="_blank">Cookie Policy</a></Content></ContentWrapper>
                </LinkBlock>
            </LinksSection>
            <PartialHr />
            <Copyright>&copy; 2023 FlishFlash</Copyright>
        </FooterWrapper>
        </>
    )
}

export default Footer;