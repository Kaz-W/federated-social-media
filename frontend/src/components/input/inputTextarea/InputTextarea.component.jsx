import React from 'react';
import styles from "./InputTextarea.module.scss";

const InputTextarea = ({className, ...rest}) => {
  return (
    <textarea className={`${styles.input_textarea} ${className ?? ''}`} {...rest} />
  );
};

export default InputTextarea;
