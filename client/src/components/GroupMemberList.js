import React from 'react'
import PropTypes from 'prop-types'
import UserTile from './UserTile'

function GroupMemberList(props) {
    return(
        <div>
            {props.groupMemberIds.map(memberId => <UserTile key={memberId} memberId={memberId} />)}
        </div>
    )
}

GroupMemberList.propTypes = {
    groupMemberIds: PropTypes.array
}

export default GroupMemberList
