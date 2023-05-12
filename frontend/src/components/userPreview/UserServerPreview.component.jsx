import React, {useEffect, useState} from "react";
import api from "../../utils/api";
import styles from "./UserPreview.module.scss";
import Spinner from "../spinner/Spinner.component";
import MessageBanner from "../messageBanner/MessageBanner.component";
import Button from "../button/Button.component";

function UserServerPreview({ user, reload }) {

  const [ priv, setPriv ] = useState('user');
  const [ banned, setBanned ] = useState(false);
  const [ busy, setBusy ] = useState(false);
  const [ failed, setFailed ] = useState(null);

  useEffect(() => {
    if (user.serverRole) {
      if (user.serverRole === 'banned') {
        setBanned(true);
      } else {
        setPriv(user.serverRole);
      }

    } else {
      setPriv('user');
      setBanned(false);
    }

  }, [user]);

  async function onChangePriv(newPriv) {
    setBusy(true);
    setFailed(null);

    const newRole = { serverRole: newPriv === 'user' ? null : newPriv };
    let res = await api.patch(`/internal/users/${user.id}/server-role`, newRole);

    if (res.ok) {
      setPriv(newPriv);
      reload();
    } else {
      setFailed(`Couldn't change role (${res.err})`);
    }

    setBusy(false);
    return res.ok;
  }

  function onSetBan(banned) {
    return async function (e) {
      const successful = await onChangePriv(banned ? 'banned' : 'user');
      if (successful) {
        setBanned(banned);
      }
    }
  }

  return (
    <div className={styles.user_preview}>
      <p>{user.username}</p>
      {busy && <Spinner inline={true} />}
      {failed && <MessageBanner size="slim" status="error">{failed}</MessageBanner>}
      <select disabled={busy} value={priv} onChange={e => onChangePriv(e.target.value)}>
        <option value='admin'>Admin</option>
        <option value='user'>User</option>
      </select>
      {!banned && <Button disabled={busy} onClick={onSetBan(true)} colour="danger">Ban</Button>}
      {banned && <Button disabled={busy} onClick={onSetBan(false)} colour="primary">UnBan</Button>}
    </div>
  )
}

export default UserServerPreview;
