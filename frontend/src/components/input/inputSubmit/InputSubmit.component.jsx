import React from 'react';
import styles from './InputSubmit.module.scss';

const InputSubmit = (props) => {
  return (
    <div className={styles.input_submit}>
      <input type="submit" {...props}/>
    </div>
  );
};

export default InputSubmit;
