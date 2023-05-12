import React, {useEffect, useState} from 'react';
import MenuItem from "../menu/menuItem/MenuItem.component";
import api from "../../utils/api";
import * as PropTypes from "prop-types";

const DeleteAction = ({ contentUrl, onDelete, ...rest }) => {

  const [ busy, setBusy ] = useState(false);
  const [ mounted, setMounted ] = useState(true);

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  async function handleDelete() {
    setBusy(true);

    const res = await api.relay.del(contentUrl);
    if (res.ok) {
      onDelete(true); // Tell parent component that the delete was successful.
    } else {
      onDelete(false, res.err); // Tell parent component that the delete was unsuccessful.
    }

    if (mounted) setBusy(false);
  }

  return (
    <MenuItem {...rest} loading={busy} disabled={busy} colour={'danger'} onClick={handleDelete}>Delete</MenuItem>
  );
};

DeleteAction.propTypes = {
  contentUrl: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default DeleteAction;
