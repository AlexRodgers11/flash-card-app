import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router'
import { fetchGroupData } from '../reducers/groupSlice';
import DeckList from './DeckList'
import GroupMemberList from './GroupMemberList';

function Group() {
    const dispatch = useDispatch();
    let { groupId } = useParams();
    console.log(`paramsGroupId: ${groupId}`);
    let storedGroupId = useSelector((state) => state.group.groupId);
    let groupName = useSelector((state) => state.group.name);
    let groupMemberIds = useSelector((state) => state.group.memberIds);

    useEffect(() => {
        //if a group hasn't already been stored, or if the stored groupId is different than the one passed to Group as a route parameter
        if(!storedGroupId || storedGroupId !== groupId) {
            dispatch(fetchGroupData(groupId));
        }
    }, [storedGroupId, groupId, dispatch]);

    return (
        <div>
            <p>{groupName}</p>
            <GroupMemberList groupMembersIds={groupMemberIds} />
            <DeckList listType="group" listId={groupId} />
        </div>
  )
}

export default Group