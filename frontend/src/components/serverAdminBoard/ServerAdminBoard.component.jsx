import React, {useEffect, useState} from 'react';
import BasicCreator from "../basicCreator/BasicCreator.component";
import Spinner from "../spinner/Spinner.component";
import api from "../../utils/api";
import MessageBanner from "../messageBanner/MessageBanner.component";
import ServerAdminPreview from "../userPreview/ServerAdminPreview.component";

const ServerAdminBoard = () => {

  const [ busy, setBusy ] = useState(false);
  const [ failed, setFailed ] = useState(null);
  const [ servers, setServers ] = useState([]);

  useEffect(() => {
    reloadServers();
  }, [])

  async function onAddServer(url) {
    setBusy(true);
    setFailed(null); // Clear previous error if there was one.

    const newServer = { url }

    const res = await api.post('/servers', newServer);

    if (!res.ok) {
      setFailed(res.err);
    }

    setBusy(false);
  }

  async function reloadServers() {
    setBusy(true);

    const res = await api.get('/servers');

    if (res.ok) {
      setServers(res.data);
    }

    setBusy(false);
  }

  return (
    <div>
      <h1>Server Admin Board</h1>
      {failed && <MessageBanner size="slim" status="error">{failed}</MessageBanner>}
      {busy && <Spinner />}
      {!busy && <BasicCreator contentName="Url" onCreate={onAddServer}/>}
      {servers?.map(server => <ServerAdminPreview key={server.id} server={server} triggerReload={reloadServers} />)}
    </div>
  );
};

export default ServerAdminBoard;
