import styled from "styled-components";

const CookiePolicyWrapper = styled.div`
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

const CookiePolicyContainer = styled.div`
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

export function CookiePolicy() {
    return (
        <CookiePolicyWrapper>
            <CookiePolicyContainer>
                <PageTitle>FlishFlash Cookie Policy</PageTitle>
                <Date>Last updated: April 18th, 2023</Date>
                
                <br/>

                <ImportantText>At FlishFlash, we are committed to maintaining the privacy and trust of our users. This Cookie Policy explains how we use cookies to enhance your experience on our website and the types of cookies we use. By using our website, you agree to the use of cookies as described in this policy:</ImportantText>

                <br/>
                <br/>

                <Section>
                    <SectionHeader>What are cookies?</SectionHeader>

                    <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to improve user experience by enabling websites to remember certain information, like items in a shopping cart or preferences you have selected.</p>
                </Section>

                <Section>
                    <SectionHeader>How we use cookies</SectionHeader>

                    <p>At FlishFlash, we only use cookies for site interactivity and to provide you with a better user experience. Our cookies do not track your personal information or browsing activities on other websites. The cookies we use are essential for the proper functioning of our website, and they help us provide you with a seamless browsing experience.</p>
                </Section>

                <Section>
                    <SectionHeader>Types of cookies we use</SectionHeader>

                    <ol type="numbers">
                        <li>Strictly necessary cookies: These cookies are essential for the operation of our website. They enable you to navigate our site and use its features, such as accessing secure areas and maintaining your preferences after refreshing the page.</li>

                        <li>Functionality cookies: These cookies types of cookies allow a website to remember information specific to you or the choices you make, such as your login credientials, preferred language, currency, or other settings. They help improve your experience by providing personalized features and enabling a more tailored experience.</li>
                    </ol>
                </Section>

                <Section>
                    <SectionHeader>Your consent</SectionHeader>

                    <p>By using our website, you agree to the placement of these cookies on your device. If you do not wish to accept cookies from our website, you can adjust your browser settings to refuse cookies or to notify you when a cookie is being set. However, please note that some features of our website may not function properly without cookies.</p>
                </Section>

                <Section>
                    <SectionHeader>How to control cookies</SectionHeader>

                    <p>You can control and/or delete cookies as you wish. Most browsers allow you to manage cookies through their settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="http://www.aboutcookies.org" target="_blank" rel="noreferrer">www.aboutcookies.org</a> or <a href="http://www.allaboutcookies.org" target="_blank" rel="noreferrer">www.allaboutcookies.org</a>.</p>
                </Section>

                <Section>
                    <SectionHeader>Changes to our Cookie Policy</SectionHeader>

                    <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page, and the "Last Updated" date will be updated accordingly. We encourage you to review it regularly to stay informed about our use of cookies.</p>
                </Section>

                <Section>
                    <SectionHeader>Contact us</SectionHeader>

                    <p>If you have any questions or concerns about our use of cookies, please feel free to contact us at admin@flishflash.org.</p>
                </Section>

            </CookiePolicyContainer>
        </CookiePolicyWrapper>
    );
}