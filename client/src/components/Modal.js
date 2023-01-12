import React from 'react'
import PropTypes from 'prop-types'
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
	border-radius: 1em;
	padding: 1em;
	padding-top: 0;
	overflow: scroll;
	max-height: 70%;
	scrollbar-width: none;
	&::-web-kit-scrollbar {
		display: none;
	}
`;

const ModalClose = styled.p`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	height: 1em;
	margin: 0;
	padding-top: 0.5em;
`;

function Modal(props) {
	return (
		<ModalWrapper className='Modal_active'>
			<ModalBackdrop onClick={props.hideModal}></ModalBackdrop>
			<ModalContent>
				<ModalClose onClick={props.hideModal}>{props.hideModal && "X"}</ModalClose>
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
