import React, {useEffect, useState} from 'react';
import api from "../../utils/api";

import BasicSearchbox from "../basicSearchbox/BasicSearchbox.component";
import UserServerPreview from "../userPreview/UserServerPreview.component";
import MessageBanner from "../messageBanner/MessageBanner.component";
import Spinner from "../spinner/Spinner.component";

function UserServerAdminBoard(props) {

  const [ busy, setBusy ] = useState(true);
  const [ failed, setFailed ] = useState(null);
  const [ users, setUsers ] = useState(null);
  const [ search, setSearch ] = useState('');

  useEffect(() => {
    getUsers();
  }, []);

  async function getUsers() {
    setBusy(true);
    setFailed(null);

    const res = await api.get('/internal/allusers');

    if (res.ok) {
      setUsers(res.data);
    } else {
      setFailed(`Couldn't fetch users (${res.err})`);
    }

    setBusy(false);
  }

  function generateUsers() {
    if (busy) {
      return <Spinner />;
    }

    return (
      <div>
        {users
          ?.filter(user => (search) ? user.username.includes(search) : true)
          .map(user => <UserServerPreview key={user.id} user={user} reload={getUsers} />)}
      </div>
    );
  }


  return (
    <div>
      <h1>User Admin Board</h1>
      <BasicSearchbox onSubmit={setSearch} />
      {failed && <MessageBanner status='error'>{failed}</MessageBanner>}
      {generateUsers()}
    </div>
  );

}

export default UserServerAdminBoard;
