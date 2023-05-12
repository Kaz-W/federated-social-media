import React, {useState} from 'react';
import BasicCreator from "../basicCreator/BasicCreator.component";
import ProtectedComponent from "../protectedComponent/ProtectedComponent.component";
import api from "../../utils/api";
import Spinner from "../spinner/Spinner.component";
import MessageBanner from "../messageBanner/MessageBanner.component";

const SubforumCreator = ({forum, onCreate }) => {

  const [ busy, setBusy ] = useState(false);
  const [ failed, setFailed ] = useState(null);

  const handleCreate = async content => {
    if (!content) {
      setFailed("Enter a name!");
      return;
    }

    setBusy(true);
    setFailed(null);

    const newSubforum = {
      subforumName: content,
    };

    const res = await api.relay.post(forum._links?.subforums?.href, newSubforum);

    if (!res.ok) {
      setFailed(res.err ?? 'Creation failed');
    }

    setBusy(false);
    if (onCreate) onCreate(); // Tell the parent component the operation has completed.
  }

  return (
    <ProtectedComponent action='create a Subforum'>
      <BasicCreator contentName='Subforum' onCreate={handleCreate} />
      {busy && <Spinner />}
      {failed && <MessageBanner status={"error"}>{failed}</MessageBanner>}
    </ProtectedComponent>
  );
};

export default SubforumCreator;
