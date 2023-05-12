import React from 'react';
import * as PropTypes from "prop-types";
import styles from './Spinner.module.scss';

const Spinner = ({ inline, size }) => {

  const addInline = inline ? styles.inline : '';
  const sizeClass = styles[`s_${size}`] ?? styles.s_normal;

  return (
    <div className={`${styles.spinner_wrapper} ${addInline}`}>
      <div className={`${styles.spinner} ${sizeClass}`}/>
    </div>
  );
};

Spinner.propTypes = {
  inline: PropTypes.bool,
  size: PropTypes.oneOf(["small", "normal", "large"])
}

Spinner.defaultProps = {
  inline: false,
  size: "normal"
}

export default Spinner;
