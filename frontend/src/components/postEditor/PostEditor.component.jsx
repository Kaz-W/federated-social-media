import React, {useState} from 'react';
import * as PropTypes from 'prop-types';
import styles from './PostEditor.module.scss';
import InputText from "../input/inputText/InputText.component";
import InputTextarea from "../input/inputTextarea/InputTextarea.component";
import Button from "../button/Button.component";
import api from "../../utils/api";
import MessageBanner from "../messageBanner/MessageBanner.component";

const PostEditor = ({ post, onEdit }) => {

  const [ data, setData ] = useState(post);
  const [ busy, setBusy ] = useState(false);
  const [ failed, setFailed ] = useState(null);

  function handleChange(tag) {
    return function (e) {
      setData(d => ({...d, [tag]:e.target.value}));
    }
  }

  async function submit() {
    setBusy(true);

    const format = {
      postTitle: data.postTitle,
      postContents: data.postContents
    };

    const res = await api.relay.patch(post._links.self.href, format);

    if (res.ok) {
      onEdit(format);
    } else {
      setFailed(`Couldn't update post (${res.err})`);
    }

    setBusy(false);
  }

  return (
    <div className={styles.post_editor}>
      <InputText value={data.postTitle} onChange={handleChange("postTitle")} />
      <InputTextarea value={data.postContents} onChange={handleChange("postContents")} />
      <Button disabled={busy} loading={busy} colour="primary" onClick={submit}>Save</Button>
      {failed && <MessageBanner size="slim" status="error">{failed}</MessageBanner>}
    </div>
  );
};

PostEditor.propTypes = {
  post: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired
};

export default PostEditor;
