import styled from "styled-components";
import { RxEyeOpen, RxEyeClosed } from "react-icons/rx";
import { SlOptions } from "react-icons/sl";

export const DeckTileWrapper = styled.div`
    display: inline-flex; 
    flex-direction: column;    
    text-align: center;  
    justify-content: center;
    position: relative;
    border: 1px solid black; 
    border-radius: 1rem; 
    margin: 1em;
    cursor: pointer;
    height: 4.25rem;
    width: 3.25rem;
    border-radius: .65rem;
    background-color: white;
    // box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease-in-out;
    &:hover {
        transform: translateY(-7px);
    }

    @media (min-width: 475px) {
        height: 7.5rem;
        width: 5.75rem;
        border-radius: .8rem;
        border-width: 2px;
    }
    
    @media (min-width: 535px) {
        height: 8.5rem;
        width: 6.75rem;
        border-radius: 1rem;
    }

    @media (min-width: 795px) {
        height: 11rem; 
        width: 8rem; 
    }
    
    @media (min-width: 960px) {
        height: 14rem; 
        width: 10rem; 
    }

    @media (min-width: 1310px) {
        height: 17rem;
        width: 13rem;
    }
    
`

export const IndicatorsWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .1rem .1rem 0 .1rem;
    
    @media (min-width: 475px) {
        padding: .45rem .45rem 0 .45rem;
    }
    
    @media (min-width: 535px) {
        padding: .6rem .6rem 0 .6rem;
    }
    
    @media (min-width: 795px) {
        padding: .75rem .75rem 0 .75rem;
    }
    
`

export const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-weight: 600;
    // font-family: Consolas;
    font-family: monospace;
    & img {
        height: 7rem;
        width: 100%;
    }
    & .large-name {
        // font-size: .6rem;
        // @media (min-width: 475px) {
        //     font-size: .75rem;
        // }
        
        // @media (min-width: 535px) {
        //     font-size: 1rem;
        // }
    
        // @media (min-width: 795px) {
        //     font-size: 1.25rem
        // }

        
        // @media (min-width: 960px) {
        //     // font-size: 2rem;
        //     font-size: 100%;
        // }
    }
    & .medium-name {
        //once I decide size at which to not display image set font-size to be the same as large-name
        // font-size: .45rem;
        // @media (min-width: 475px) {
        //     font-size: .5625rem;
        // }
        // @media (min-width: 535px) {
        //     font-size: .75rem;
        // }
        // @media (min-width: 795px) {
        //     font-size: .8375rem;
        // }
        // @media (min-width: 960px) {
        //     font-size: 1.5rem;
        // }
    }
`

export const StyledOpenEye = styled(RxEyeOpen)`
    display: inline-block;
    // justify-self: start;
    margin: 0rem;
    height: .5rem;
    width: .5rem;
    @media (min-width: 475px) {
        height: .75rem;
        width: .75rem;
    }
    
    @media (min-width: 535px) {
        height: 1rem;
        width: 1rem;
    }

    @media (min-width: 795px) {
        height: 1.25rem;
        width: 1.25rem;
    }
`

export const StyledClosedEye = styled(RxEyeClosed)`
    display: inline-block;
    // justify-self: start;
    margin: 0rem;
    height: .5rem;
    width: .5rem;
    @media (min-width: 475px) {
        height: .75rem;
        width: .75rem;
    }
    
    @media (min-width: 535px) {
        height: 1rem;
        width: 1rem;
    }

    @media (min-width: 795px) {
        height: 1.25rem;
        width: 1.25rem;
    }
`

export const StyledOptionsIcon = styled(SlOptions)`
    display: inline-block;
    // justify-self: end;
    margin: 0rem;
    height: .5rem;
    width: .5rem;
    @media (min-width: 475px) {
        height: .75rem;
        width: .75rem;
    }

    @media (min-width: 535px) {
        height: 1rem;
        width: 1rem;
    }

    @media (min-width: 795px) {
        height: 1.25rem;
        width: 1.25rem;
    }
`;

export const Options = styled.ul`
    display: inline-block;
    padding: 0;
    display: inline-block;
    align-self: start;
    text-align: left;
    background-color: white;
    border: 1px solid black;
    margin-left: calc(.1rem - 1px);
    
    @media (min-width: 475px) {
        margin-left: calc(.45rem - 2px)
    }
    
    @media (min-width: 535px) {
        margin-left: calc(.6rem - 2px);
        border-width: 2px
    }
    
    @media (min-width: 795px) {
        margin-left: calc(.75rem - 2px);
    }
    
`;

export const Option = styled.li`
    padding: .25rem .5rem; 
    font-size: .35rem;
    padding: .05rem .1rem;
    border-bottom: 1px solid black;
    border-top: 1px;

    &.disabled {
        background-color: #D4D4D4;
        cursor: not-allowed;
        font-style: italic;
        &:hover {
            background-color: #D4D4D4;
            color: black;
        }
    }
    
    &:first-of-type {
        border-top: none;
    }
    &:last-of-type {
        border-bottom: none;
    }
    &:hover {
        background-color: black;
        color: white;
    }
    
    @media (min-width: 475px) {
        font-size: .5rem;
        padding: .1rem .2rem;
    }
    
    @media (min-width: 535px) {
        font-size: .6rem;
        padding: .15rem .3rem;
    }

    @media (min-width: 795px) {
        font-size: .8rem;
        padding: .2rem .4rem;
    }
    
    @media (min-width: 960px) {
        font-size: 1rem;
        padding: .25rem .5rem;
    }
`;

export const CardCountWrapper = styled.p`
    position: relative; 
    // left: .2rem;
    padding-left: .12rem;
    display: inline-flex;
    align-items: center;
    font-size: .75rem;
     
    margin: 0rem;
    & span:nth-of-type(1) {
        padding-right: 1px;
    }
    & span:nth-of-type(2) {
        position: relative; 
        bottom: .15rem;
        display: inline-block;
        height: .5rem;
        width: .4rem;
        bottom: .075rem;
        border: 1px solid black;
        border-radius: .1rem; 
        opacity: 1; 
        z-index: 2;
        background-color: white;
    }
    & span:nth-of-type(3) {
        position: relative;
        height: .5rem;
        width: .4rem;
        top: .075rem;
        right: .25rem;
        display: inline-block;

        border: 1px solid black; 
        borderRadius: .1rem;
    }
    font-size: .5rem;
    
    @media (min-width: 475px) {
        font-size: .75rem;
        // left: .5rem;
        padding-left: .2rem;
        & span:nth-of-type(2) {
            height: .6rem;
            width: .48rem;
            bottom: .09rem;
        }
        & span:nth-of-type(3) {
            height: .6rem;
            width: .48rem;
            top: .09rem;
            right: .3rem;
        }
    }
    
    @media (min-width: 535px) {
        font-size: 1rem;
        & span:nth-of-type(2) {
            height: .8rem;
            width: .64rem;
            bottom: .12rem;
        }
        & span:nth-of-type(3) {
            height: .8rem;
            width: .64rem;
            top: .12rem;
            right: .4rem;
        }

    }

    @media (min-width: 795px) {
        & span:nth-of-type(2) {
            height: 1rem;
            width: .8rem;
            bottom: .15rem;
        }
        & span:nth-of-type(3) {
            height: 1rem;
            width: .8rem;
            top: .15rem;
            right: .5rem;
        }
    }
`;

export const TopWrapper = styled.div`
    position: absolute;
    top: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    // align-items: start;
`;

export const RightBlock = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    left: .2rem;
    @media (min-width: 475px) {
        left: .5rem;
    }

`;