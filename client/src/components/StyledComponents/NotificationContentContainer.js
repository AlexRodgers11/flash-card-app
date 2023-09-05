import styled from "styled-components";

export const NotificationContentContainer = styled.div`
    width: 40rem;
    display: flex;
	align-items: center;
	justify-content: space-between;
	text-align: left;
	padding: .75rem 1.25rem;
	border: 1px solid black;
	border-bottom: none;
	&:last-of-type {
		border-bottom: 1px solid black;
	}

    & p {
        padding-right: .25rem;
    }
    @media (max-width: 900px) {
        width: 30rem;
    }
    @media (max-width: 700px) {
        width: 20rem;
    }
    @media (max-width: 550px) {
        width: 15rem;
        font-size: .75rem;
    }
    @media (max-width: 375px) {
        width: 12rem;
    }
`;