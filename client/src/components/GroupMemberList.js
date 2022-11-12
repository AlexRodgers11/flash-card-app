import React from 'react'
import PropTypes from 'prop-types'
import UserTile from './UserTile'
import { useSelector } from 'react-redux';

function GroupMemberList(props) {
    const administrators = useSelector((state) => state.group.administrators);
    return(
        <div>
            {/* //better to use store or propdrill? */}
            {props.groupMemberIds.map(memberId => <UserTile key={memberId} memberId={memberId} listType={props.listType} isAdmin={administrators.includes(memberId)} editMode={props.editMode} />)}
        </div>
    )
}

GroupMemberList.propTypes = {
    editMode: PropTypes.bool,
    groupMemberIds: PropTypes.array,
    listType: PropTypes.string
}

export default GroupMemberList
