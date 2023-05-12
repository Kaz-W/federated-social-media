import React from "react";

export default function Forum(props) {
    const {data} = props;
    return (
        <h5><a href={`/servers/${data.serverId}/forums/${data.id}`}>{data.forumName}</a></h5>
    );
}
