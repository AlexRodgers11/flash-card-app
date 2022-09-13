import React from 'react'
import PropTypes from 'prop-types'
import Activity from './Activity'

function ActivityList(props) {
  return (
    <div>
        {props.activityIds.map(id => <Activity key={id} activityId={id} />)}
    </div>
  )
}

ActivityList.propTypes = {
    activityIds: PropTypes.array
}

export default ActivityList
