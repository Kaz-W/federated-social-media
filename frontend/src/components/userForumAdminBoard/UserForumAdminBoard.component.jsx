import React, {useEffect, useState} from 'react';
import BasicSearchbox from "../basicSearchbox/BasicSearchbox.component";
import api from "../../utils/api";
import Spinner from "../spinner/Spinner.component";
import UserForumPreview from "../userPreview/UserForumPreview.component";

const UserForumAdminBoard = () => {

  const [ users, setUsers ] = useState(null);
  const [ busy, setBusy ] = useState(true);
  const [ usersBusy, setUsersBusy ] = useState(true);
  const [ forums, setForums ] = useState(null);
  const [ forumRoles, setForumRoles ] = useState(null);
  const [ selectedForum, setSelectedForum ] = useState(null);
  const [ search, setSearch ] = useState('');

  useEffect(() => {
    getForums();
    getUsers();
  }, []);

  useEffect(() => {
    setUsersBusy(users == null || forumRoles == null)
  }, [forumRoles, users]);

  async function getForums() {
    setBusy(true);
    let res = await api.get('/forums');
    if (res.ok) {
      setForums(res.data._embedded.forumList);
    }
    setBusy(false);
  }

  async function getForumRoles(forumId) {
    setSelectedForum(forumId);
    const res = await api.get(`/internal/forums/${forumId}/roles`);
    if (res.ok) {
      // Convert to ID based dictionary.
      const roles = res.data;
      if (roles.length > 0) {
        const rolesDict = roles.reduce((acc, role) => ({...acc, [role.userId]: role}), {});
        console.log(rolesDict);
        setForumRoles(rolesDict);
      } else {
        setForumRoles(roles);
      }
    } else {
      console.error(res.err);
    }
  }

  async function getUsers() {
    setBusy(true);
    const res = await api.get('/internal/allusers');
    if (res.ok) {
      setUsers(res.data);
    }
    setBusy(false);
  }

  function generateForumDropdown() {
    return (
      <div>
        <select value={selectedForum ?? 'Loading...'} onChange={(e) => getForumRoles(e.target.value)}>
          {forums?.map(forum => <option value={forum.id} key={forum.id}>{forum.forumName}</option>)}
        </select>
        {busy && <Spinner inline={true}/>}
      </div>
    );
  }

  function generateUsers() {

    let userListing;
    if (selectedForum == null) {
      userListing = <p>Select a forum.</p>
    } else if (usersBusy) {
      userListing = <Spinner />
    } else {
      userListing = users
        .filter(user => (search) ? user.username.includes(search) : true)
        .map(user => <UserForumPreview key={user.id} role={forumRoles[user.id]} user={user} forumId={selectedForum} reload={() => getForumRoles(selectedForum)}/>);
    }

    return (
      <div>
        {userListing}
      </div>
    );
  }

  return (
    <div>
      <h1>Forum Admin Board</h1>
      {generateForumDropdown()}
      <BasicSearchbox onSubmit={setSearch} busy={busy} />
      {generateUsers()}
    </div>
  );
};

export default UserForumAdminBoard;
