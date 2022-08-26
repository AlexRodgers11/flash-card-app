import React from 'react'
import PropTypes from 'prop-types'

function TrueFalseCard(props) {
  return (
    <div>TrueFalseCard</div>
  )
}

TrueFalseCard.propTypes = {
    card: PropTypes.object,
    answerCard: PropTypes.func
}

export default TrueFalseCard
