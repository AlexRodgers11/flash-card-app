import styled from "styled-components";
import { IoBulbSharp } from "react-icons/io5";

export const HintBox = styled.div`
	position: absolute;
	width: 28rem;
	text-align: left;
    color: white;
	& .hint-icon {
		margin: 1rem;
	}
	& p {
		display: inline-block;
		margin-left: .5rem;
		font-style: italic;
		font-size: .75rem 	;
		word-wrap: break-word;
		overflow-wrap: break-word; 
	}
`

export const StyledHintIcon = styled(IoBulbSharp).attrs({
	className: "hint-icon",
	role: "button"
})`
	height: 1.75rem;
	width: 1.75rem;
	cursor: pointer;
	&:hover {
		color: yellow;
	}
	@media (max-width: 600px) {
		height: 1.5rem;
	}
	@media (max-width: 550px) {
		height: 1.25rem;
	}
`;