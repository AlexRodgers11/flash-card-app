import React from 'react'
import PropTypes from 'prop-types'
import GroupTile from './GroupTile'

function GroupList(props) {
    return(
        <div>
            {props.groupIds.map(groupId => <GroupTile key={groupId} groupId={groupId} />)}
        </div>
    )
}

GroupList.propTypes = {
    groupIds: PropTypes.array
}

export default GroupList
