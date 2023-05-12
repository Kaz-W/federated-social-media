import React from 'react';
import styles from './Subforum.module.scss';
import Button from "../../button/Button.component";

const Subforum = (props) => {

  const { subforum, selectedSubforumId, onSelect} = props;

  const activeClass = subforum.id === selectedSubforumId ? styles.active : '';

  return (
    // <div className={`${styles.subforum_item} ${activeClass}`} onClick={() => onSelect(subforum)}>
    //   {subforum.subforumName}
    // </div>
    <Button className={`${styles.subforum_item} ${activeClass}`} alignment='left' size="big" onClick={() => onSelect(subforum)}>
      {subforum.subforumName}
    </Button>
  );
};

export default Subforum;
