import React from 'react';
import styles from './Button.module.scss';
import PropTypes from 'prop-types';
import { Button as ReakitButton } from 'reakit';
import Spinner from "../spinner/Spinner.component";

const Button = (props) => {
  const { children, colour, size, alignment, loading, className, ...rest } = props;
  const colourClass = styles[`c_${colour}`] ?? styles.c_normal;
  const sizeClass = styles[`s_${size}`] ?? styles.s_normal;
  const alignmentClass = styles[`a_${alignment}`] ?? styles.a_center;

  return (
    <ReakitButton className={`${styles.button} ${colourClass} ${sizeClass} ${alignmentClass} ${className ?? ''}`} {...rest} role="button">
      {loading && <div className={styles.loading}><Spinner size={"small"}/></div>}
      {children}
    </ReakitButton>
  );
};

Button.propTypes = {
  colour: PropTypes.oneOf(['normal', 'primary', 'danger', 'invert', 'none']),
  size: PropTypes.oneOf(['normal', 'small', 'big']),
  alignment: PropTypes.oneOf(['left', 'center', 'right'])
}

export default Button;
