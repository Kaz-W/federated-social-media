import React from "react";

export default function Subforum(props) {
    const {data, serverId} = props;
    return (
        <h5><a href={`/servers/${serverId}/subforums/${data.id}`}>{data.subforumName}</a></h5>
    );
}