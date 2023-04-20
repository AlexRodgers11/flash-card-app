import styled from "styled-components";

const PrivacyPolicyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-height: calc(100vh - 5.5rem);
    background-color: #ffe180;    
    background-color: #ffe9a6;    
    background-color: #d9e3ff;
    background-color: #e6ecff;
`;

const PrivacyPolicyContainer = styled.div`
    width: 60%;
    @media (max-width: 1000px) {
        width: 70%;
        
    }
    @media (max-width: 500px) {
        width: 85%;
        
    }
    padding-bottom: 2.5rem;
`;

const PageTitle = styled.h1`
    margin-top: 1rem;
`;

const Date = styled.p`
    font-style: italic;
`;

const ImportantText = styled.h3`
    font-weight: 800;
    @media (max-width: 500px) {
        font-weight: 700;
        font-size: 1rem;
    }
`;

const SectionHeader = styled.h4`
    font-weight: 700;
    @media (max-width: 500px) {
        font-size: .85rem;
    }
`;

const Section = styled.section`
    margin-bottom: 1rem;
    & ol {
        margin-bottom: 0;
    }
    & li {
        &::marker {
            content: normal;
        }
    }
    & > :nth-child(2) {
        text-align: left;
        @media (max-width: 500px) {
            font-size: .75rem;
        }
    }
    & a {
        font-weight: 500;
    }
`;

export function PrivacyPolicy() {
    return (
        <PrivacyPolicyWrapper>
            <PrivacyPolicyContainer>
                <PageTitle>FlishFlash Privacy Policy</PageTitle>
                <Date>Last updated: April 19th, 2023</Date>
                
                <br/>

                <ImportantText>Welcome to FlishFlash, a flash card website designed to help you study and learn in a fun and efficient manner. We are committed to protecting your privacy and handling your personal information with care. This Privacy Policy outlines the types of information we collect, how we use it, and the measures we take to safeguard it. By using our website, you agree to the terms of this Privacy Policy. If you do not agree with these terms, please do not access or use our services.</ImportantText>

                <br/>
                <br/>

                <Section>
                    <SectionHeader>Information We Collect</SectionHeader>
                    <div>
                        <p>We collect two types of information:</p>

                        <ol type="numbers">
                            <li><strong>Personal Information:</strong> This includes information you provide when you create an account, such as your name, email address, and password. We may also collect additional information if you choose to provide it, such as your profile picture or other preferences.</li>

                            <li><strong>Non-Personal Information:</strong> We automatically collect certain non-personal information when you use our website, such as your IP address, browser type, device type, and operating system. This helps us improve the user experience and functionality of our website.</li>
                        </ol>
                    </div>
                </Section>

                <Section>
                    <SectionHeader>How We Use Your Information</SectionHeader>

                    <div>
                        <p>We use your personal information for the following purposes:</p>

                        <ol type="numbers">
                            <li>To provide our services, including the creation of personalized flashcards, tracking your progress, and enabling communication between users.</li>

                            <li>To communicate with you regarding your account, updates, and any customer support inquiries.</li>

                            <li>To improve our website, analyze usage patterns, and develop new features.</li>

                            <li>To send you promotional materials and newsletters, only if you have opted in to receive them.</li>
                        </ol>

                        <p><strong><em>We do not sell, trade, or rent your personal information to third parties.</em></strong></p>
                    </div>
                </Section>

                <Section>
                    <SectionHeader>Security of Your Information</SectionHeader>

                    <p>We take the security of your information seriously. We implement a variety of security measures, including a JWT token system, to help protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee its absolute security.</p>
                </Section>

                <Section>
                    <SectionHeader>Recommendations for Users</SectionHeader>
                    <div>
                        <p>We recommend that you take the following precautions to protect your personal information:</p>

                        <ol type="numbers">
                            <li>Use a strong, unique password for your FlishFlash account.</li>

                            <li>Be cautious when using public or shared computers, and always log out before leaving to ensure that your JWT token is cleared and your account is not accessed by others.</li>

                            <li>Keep your device's operating system, browser, and security software up-to-date.</li>

                            {/* <li>To send you promotional materials and newsletters, only if you have opted in to receive them.</li> */}
                        </ol>
                    </div>
                </Section>
                <Section>
                    <SectionHeader>Public Information and Privacy Settings</SectionHeader>

                    <p>By default, your name, username, email address, and all decks you create are public and can be viewed by other users on the platform. If you would like to change the visibility of this information, you can do so by visiting the user settings page. To access the user settings page, click the gear icon from the Dashboard. From there, you can adjust your privacy preferences as desired.</p>
                </Section>

                <Section>
                    <SectionHeader>Account Deletion and Data Removal</SectionHeader>
                    <div>
                        <p>You have the right to delete your account at any time. Upon account deletion, all of your personal information, flashcards, and other associated data will be permanently removed from our system. To delete your account, please go to the user settings page once logged in (click on the gear icon), then click the Delete Profile button at the bottom of the page.</p> 

                        <br />
                        
                        <p>Upon deletion of your account, any messages or notifications people received that included your name or username will have the name/username section replaced with "deleted user", leaving absolutely no trace to other users that you ever used our website. Please note that while all of the decks you created will be deleted, any copies of those decks that have been made, either by other users or by your submission of them to any groups you were in, will remain.</p>
                    </div>
                </Section>

                <Section>
                    <SectionHeader>Changes to Our Privacy Policy</SectionHeader>

                    <p>We may update our Privacy Policy from time to time. Any changes will be posted on this page, and the "Last Updated" date will be updated accordingly. Your continued use of our website after any changes to the Privacy Policy indicates your acceptance of the updated terms.</p>
                </Section>

                <Section>
                    <SectionHeader>Contact us</SectionHeader>

                    <p>If you have any questions or concerns about our use of cookies, please feel free to contact us at admin@flishflash.org.</p>
                </Section>

            </PrivacyPolicyContainer>
        </PrivacyPolicyWrapper>
    );
}