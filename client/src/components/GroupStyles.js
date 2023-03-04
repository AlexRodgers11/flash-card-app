import styled from "styled-components";
import { NavLink } from "react-router-dom";

export const GroupWrapper = styled.div`
    min-height: calc(100vh - 5.5rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #FF6565;
`;

export const GroupNavbar = styled.div`
    position: fixed;
    top: 5.5rem;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    min-width: 350px;
    width: 100%;
    height: 3rem;
    background-color: #393939;
    color: white;
    font-size: 1.25rem;
    @media (max-width: 960px) {
        font-size: 1rem;       
    @media (max-width: 790px) {
        font-size: .85rem;
    }
    @media (max-width: 690px) {
        font-size: .75rem;
    }
    @media (max-width: 625px) {
        font-size: .65rem;
    }
    @media (max-width: 515px) {
        font-size: .85rem;
        height: 5rem;
        flex-direction: column;
        justify-content: center;
    }
`;

export const OutletContainer = styled.div`
    min-height: calc(100vh - 8.5rem);
    padding-top: 4.5rem;
    display: flex;
    flex-direction: column;
    @media (max-width: 515px) {
        padding-top: 6.5rem;
    }
`;

export const StyledNavLink = styled(NavLink)`
    color: white !important;
`;

export const GroupTitle = styled.h1`
    color: white;
    font-weight: 700;
    font-size: 4.5rem;
    line-height: 6.6rem;
`;

export const StyledLeaveButton = styled.button`
    display: inline-flex;
    align-self: end;
    position: relative;
    top: 4rem;
    @media (max-width: 515px) {
        top: 6rem;
    }
    right: 1rem;
    background-color: black;
    color: white;
`;

export const DeckOptionContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    & p {
        width: 250px;
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 1rem;
        @media (max-width: 400px) {
            width: 200px;
            font-size: .9rem;
        }
    }
`;

export const DeckOption = styled.div`
    width: 250px;
    border: 1px solid black;
    margin-bottom: .25rem;
    padding: .15rem;
    cursor: pointer;
    @media (max-width: 400px) {
        width: 200px;
        font-size: .75rem;
    }
`;

export const GroupMemberOptionsContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    & p {
        width: 250px;
        font-size: 1.25rem;
        font-weight: 700;
        margin-bottom: 1rem;
        @media (max-width: 400px) {
            width: 200px;
            font-size: .9rem;
        }
    }
`;

export const JoinOptionContainer = styled.div`
    display: inline-block;
    margin-bottom: 3.75rem;
    & label {
        margin-right: .5rem;
    }
    & select {
        display: inline-block;
        padding: .275rem .55rem;
        margin-bottom: .25rem;
    }
    @media (max-width: 500px) {
        font-size: .85rem;
    }
`;
