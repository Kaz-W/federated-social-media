import React from 'react';
import styles from './Forum.module.scss';
import Button from "../../button/Button.component";

const Forum = (props) => {
  const { forum, onSelect, disabled } = props;

  return (
    <Button onClick={() => onSelect(forum)} disabled={disabled} className={styles.forum_item} size='big' alignment='left'>
      {forum.forumName}
    </Button>
  );
};

export default Forum;
