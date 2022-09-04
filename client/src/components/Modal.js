import React from 'react'
import PropTypes from 'prop-types'
import './Modal.css';

function Modal(props) {
	return (
		<div className='Modal_active'>
			<div className='Modal_backdrop' onClick={props.hideModal}></div>
			<div className='Modal_content'>
				<p className='Modal_close' onClick={props.hideModal}>X</p>
				{React.cloneElement(props.children,{hideModal: props.hideModal})}
			</div>
		</div>
)
}

Modal.propTypes = {
	showModal: PropTypes.bool,
	hideModal: PropTypes.func
}

export default Modal
