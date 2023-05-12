import React, {useState} from 'react';
import styles from './UserPreview.module.scss';
import * as PropType from "prop-types";
import Button from "../button/Button.component";
import MessageBanner from "../messageBanner/MessageBanner.component";
import Spinner from "../spinner/Spinner.component";
import api from "../../utils/api";

const ServerAdminPreview = ({ server, triggerReload }) => {

  const [ busy, setBusy ] = useState(false);
  const [ failed, setFailed ] = useState(null);


  async function deleteServer(e) {
    e.preventDefault();
    setBusy(true);

    const res = await api.del(`/servers/${server.id}`);

    if (res.ok) {
      triggerReload();
    } else {
      setFailed(res.err);
    }

    setBusy(false);
  }

  return (
    <div className={styles.user_preview}>
      <p>{server.url}</p>
      {busy && <Spinner inline={true} />}
      {failed && <MessageBanner size="slim" status="error">{failed}</MessageBanner>}
      <Button disabled={busy} colour="danger" onClick={deleteServer}>Delete</Button>
    </div>
  );
};

ServerAdminPreview.propTypes = {
  server: PropType.object.isRequired,
  triggerReload: PropType.func.isRequired
}

export default ServerAdminPreview;
