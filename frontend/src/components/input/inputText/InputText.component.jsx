import React from 'react';
import styles from './InputText.module.scss'

const InputText = ({className, ...rest}) => {
  return (
    <input type="text" className={`${styles.input_text} ${className ?? ''}`} {...rest} />
  );
};

export default InputText;
