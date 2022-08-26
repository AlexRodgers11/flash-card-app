import React from 'react'
import PropTypes from 'prop-types'

function FlashCard(props) {
  return (
    <div>FlashCard</div>
  )
}

FlashCard.propTypes = {
    card: PropTypes.object,
    answerCard: PropTypes.func
}

export default FlashCard
