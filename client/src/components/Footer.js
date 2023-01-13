import styled from "styled-components";

const FooterWrapper = styled.footer`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 1rem;
    background-color: black;
    opacity: 95%;
    color: #a3a3a3;
    @media (max-width: 500px) {
        flex-direction: column;
        padding-top: 1.5rem;
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

function Footer() {
    return (
        <FooterWrapper className="FooterWrapper">
            <LinkBlock className="LinkBlock">
                <LinkBlockHeading>Heading 1</LinkBlockHeading>
                <ContentWrapper>Link 1</ContentWrapper>
                <ContentWrapper>Link 2</ContentWrapper>
                <ContentWrapper>Link 3</ContentWrapper>
                <ContentWrapper>Link 4</ContentWrapper>
                <ContentWrapper>Link 5</ContentWrapper>
            </LinkBlock>
            <LinkBlock className="LinkBlock">
                <LinkBlockHeading>Heading 2</LinkBlockHeading>
                <ContentWrapper>Link 1</ContentWrapper>
                <ContentWrapper>Link 2</ContentWrapper>
                <ContentWrapper>Link 3</ContentWrapper>
                <ContentWrapper>Link 4</ContentWrapper>
                <ContentWrapper>Link 5</ContentWrapper>
            </LinkBlock>
            <LinkBlock className="LinkBlock">
                <LinkBlockHeading>Heading 3</LinkBlockHeading>
                <ContentWrapper>Link 1</ContentWrapper>
                <ContentWrapper>Link 2</ContentWrapper>
                <ContentWrapper>Link 3</ContentWrapper>
                <ContentWrapper>Link 4</ContentWrapper>
                <ContentWrapper>Link 5</ContentWrapper>
            </LinkBlock>
        </FooterWrapper>
    )
}

export default Footer;