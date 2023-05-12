import React from 'react';
import ProtectedComponent from "../protectedComponent/ProtectedComponent.component";
import api from "../../utils/api";
import BasicCreator from "../basicCreator/BasicCreator.component";

const ForumCreator = ({ onCreate }) => {

  const handleCreate = async content => {
    if (!content) return;

    const newForum = {
      forumName: content
    };

    await api.post('/internal/forums', newForum);

    if (onCreate) onCreate(); // Tell the parent component the operation has completed.
  }

  return (
    <ProtectedComponent action='create a Forum'>
      <BasicCreator contentName='Forum' onCreate={handleCreate} />
    </ProtectedComponent>
  );
};

export default ForumCreator;
