import React from 'react'
import PropTypes from 'prop-types'
import { IoClose } from "react-icons/io5";
import styled from 'styled-components';

const ModalWrapper = styled.div`
	position: fixed;
	display: flex;
	justify-content: center;
	align-items: center;
	top: 0;
	height: 100vh;
	width: 100%;
	z-index: 2;
	& button {
		margin: 1.5rem .15rem .25rem .15rem;
		@media (max-width: 500px) {
			margin: .15rem .15rem;
		}
	}
`;

const ModalBackdrop = styled.div`
	background-color: cornflowerblue;
	opacity: 0.4;
	height: 100%;
	width: 100%;
`;

const ModalContent = styled.div`
	position: fixed;
	background: white;
	color: black;
	z-index: 3;
	opacity: 1;
	border: 3px solid black;
	border-radius: 1rem;
	padding: 4rem 4rem 4rem 4rem;
	overflow: scroll;
	max-height: 70%;
	scrollbar-width: none;
	&::-web-kit-scrollbar {
		display: none;
	}
	& input {

	}
	& button {
		margin-top: 3.5rem;
	}
`;

const ModalClose = styled.p`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	margin: 0;
	padding-top: 0.25rem;
`;


const StyledCloseIcon = styled(IoClose)`
	position: relative;
	left: 3.75rem;
	bottom: 4rem;
	font-size: 2rem;
	cursor: pointer;
`;

function Modal(props) {
	return (
		<ModalWrapper className='Modal_active'>
			<ModalBackdrop onClick={props.hideModal}></ModalBackdrop>
			<ModalContent>
				<ModalClose className="ModalClose" onClick={props.hideModal}>{props.hideModal && <StyledCloseIcon />}</ModalClose>
				{props.children}
			</ModalContent>
		</ModalWrapper>
	)
}

Modal.propTypes = {
	showModal: PropTypes.bool,
	hideModal: PropTypes.func
}

export default Modal
