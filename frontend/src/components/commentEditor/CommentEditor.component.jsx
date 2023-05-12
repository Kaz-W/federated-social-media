import React, {useState} from 'react';
import api from "../../utils/api";
import styles from "./CommentEditor.module.scss";
import Button from "../button/Button.component";
import MessageBanner from "../messageBanner/MessageBanner.component";
import InputText from "../input/inputText/InputText.component";

const CommentEditor = ({ comment, onEdit }) => {
  const [ data, setData ] = useState(comment);
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
      commentContent: data.commentContent
    };

    const res = await api.relay.patch(comment._links.self.href, format);

    if (res.ok) {
      onEdit(format);
    } else {
      setFailed(`Couldn't update comment (${res.err})`);
    }

    setBusy(false);
  }

  return (
    <div className={styles.comment_editor}>
      <InputText value={data.commentContent} onChange={handleChange("commentContent")} />
      <Button disabled={busy} loading={busy} colour="primary" onClick={submit}>Save</Button>
      {failed && <MessageBanner size="slim" status="error">{failed}</MessageBanner>}
    </div>
  );
};

export default CommentEditor;
