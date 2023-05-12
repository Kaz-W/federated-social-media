import React from 'react';
import styles from './InputLabel.module.scss';

export default function InputLabel({ children, ...rest }) {
  return (
    <label className={styles.input_label} {...rest}>
      { children }
    </label>
  )
}
