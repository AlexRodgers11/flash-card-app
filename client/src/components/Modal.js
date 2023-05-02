import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { IoClose } from "react-icons/io5";
import styled from 'styled-components';

const ModalWrapper = styled.div`
	position: fixed;
	display: flex;
	justify-content: center;
	align-items: center;
	left: 0;
	top: 0;
	height: 100vh;
	width: 100%;
	z-index: 3;
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
	@media (max-width: 450px) {
        padding: 2rem;
    }
	@media (max-width: 375px) {
        padding: 1rem;
    }
	overflow: scroll;
	max-height: 80%;
	scrollbar-width: none;
	&::-web-kit-scrollbar {
		display: none;
	}
`;

const StyledCloseIcon = styled(IoClose)`
	position: absolute;
	top: 1rem;
	right: 1rem;
	@media (max-width: 450px) {
		top: .5rem;
		right: .5rem;
		height: 1.75rem;
		width: 1.75rem;
	}
	@media (max-width: 375px) {
		top: .25rem;
		right: .25rem;
		height: 1.25rem;
		width: 1.25rem;
	}
	font-size: 2rem;
	cursor: pointer;
`;

function Modal(props) {
	const handleEscape = useCallback((evt) => {
		if(evt.key === "Escape") {
			props.hideModal();
		}
	}, [props]);

	useEffect(() => {
		window.addEventListener("keydown", handleEscape);
		return () => {
			window.removeEventListener("keydown", handleEscape);
		};
	}, [handleEscape, props]);

	return (
		<ModalWrapper className='Modal_active'>
			<ModalBackdrop onClick={props.hideModal}></ModalBackdrop>
			<ModalContent>
				{props.hideModal && <StyledCloseIcon role="button" onClick={props.hideModal}/>}
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