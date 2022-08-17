import React from 'react'
import { useParams } from 'react-router'
import DeckList from './DeckList'

function Group() {
    let { groupId } = useParams();
  return (
    <div>
        <DeckList listType="group" listId={groupId} />
    </div>
  )
}

export default Group