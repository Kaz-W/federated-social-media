import React, {useEffect, useState} from 'react';
import styles from './UserPreview.module.scss';
import * as PropTypes from "prop-types";
import Spinner from "../spinner/Spinner.component";
import MessageBanner from "../messageBanner/MessageBanner.component";
import Button from "../button/Button.component";
import api from "../../utils/api";

const UserForumPreview = ({ forumId, user, role, reload }) => {

  const [ priv, setPriv ] = useState('user');
  const [ busy, setBusy ] = useState(false);
  const [ failed, setFailed ] = useState(null);
  const [ banned, setBanned ] = useState(false);

  useEffect(() => {
    if (role) {
      if (role.role === 'banned') {
        setBanned(true);
      } else {
        setPriv(role.role);
      }

    } else {
      setPriv('user');
      setBanned(false);
    }

  }, [role]);

  async function onChangePriv(newPriv) {
    setBusy(true);
    setFailed(null);

    let res;
    if (role) {
      if (newPriv === 'user') {
        // When setting to user, just delete the role.
        res = await api.del(`/internal/roles/${role.id}`);
      } else {
        const newRole = { role: newPriv };
        res = await api.patch(`/internal/roles/${role.id}`, newRole);
      }

    } else {
      const newRole = {
        userId: user.id,
        forumId: forumId,
        role: newPriv
      };

      res = await api.post(`internal/roles`, newRole);
    }

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
      <select disabled={busy || banned} value={priv} onChange={(e) => onChangePriv(e.target.value)}>
        <option value='admin'>Admin</option>
        <option value='user'>User</option>
      </select>
      {!banned && <Button disabled={busy} onClick={onSetBan(true)} colour="danger">Ban</Button>}
      {banned && <Button disabled={busy} onClick={onSetBan(false)} colour="primary">UnBan</Button>}
    </div>
  );
};

UserForumPreview.propTypes = {
  user: PropTypes.object.isRequired,
  forumId: PropTypes.string.isRequired,
  role: PropTypes.object,
  reload: PropTypes.func.isRequired
}

export default UserForumPreview;
