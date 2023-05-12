import React, {useState} from 'react';
import styles from './BasicCreator.module.scss';
import InputText from "../input/inputText/InputText.component";
import Button from "../button/Button.component";
import * as PropTypes from "prop-types";

/**
 * Basic creator component that takes a name.
 */
const BasicCreator = ({ contentName, onCreate }) => {

  const [ expanded, setExpanded ] = useState(false);
  const [ content, setContent ] = useState('');

  function handleChange(e) {
    e.preventDefault();
    setContent(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onCreate(content);
    setExpanded(false);
  }

  function handleClose(e) {
    e.preventDefault();
    setExpanded(false);
  }

  if (expanded) {
    return (
      <div className={styles.basic_creator}>
        <InputText onChange={handleChange} placeholder={`${contentName} name...`} />
        <Button onClick={handleSubmit} colour='primary'><i>Create</i></Button>
        <Button onClick={handleClose} colour='danger'><i className="fas fa-times"/></Button>
      </div>
    );
  } else {
    return (
      <div className={`${styles.basic_creator} ${styles.clickable}`} onClick={() => setExpanded(true)}>
        <i className={`fas fa-folder-plus ${styles.folder_icon}`}/>&nbsp;New {contentName}
      </div>
    );
  }
};

BasicCreator.propTypes = {
  contentName: PropTypes.string.isRequired,
  onCreate: PropTypes.func.isRequired
}

export default BasicCreator;
