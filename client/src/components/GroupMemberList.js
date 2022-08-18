import React from 'react'
import PropTypes from 'prop-types'

function GroupMemberList(props) {
    return(
        <div>
            {props.groupMemberIds.map(memberId => <p>{memberId}</p>)}
        </div>
    )
}

GroupMemberList.propTypes = {
    members: PropTypes.array
}

export default GroupMemberList
