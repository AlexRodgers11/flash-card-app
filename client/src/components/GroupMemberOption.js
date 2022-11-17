import axios from "axios";
import React, { useEffect, useState } from "react";

function GroupMemberOption(props) {
    const [memberData, setMemberData] = useState();
    const baseURL = 'http://localhost:8000';

    useEffect(() => {
        if(!memberData?.firstName) {
            axios.get(`${baseURL}/users/${props.memberId}/identification`)
            .then((response) => {
                setMemberData(response.data);
            })
            .catch(err => {
                console.error(err);
            });
        }
    });

    return (
        <>
            {memberData?.firstName && <button><img alt={`${memberData.firstName}-${memberData.lastName}`} src={memberData.photo} />{memberData.firstName} {memberData.lastName}</button>}
        </>
    )
}  

export default GroupMemberOption;