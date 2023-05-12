import React from 'react';
import styles from './ProtectedComponent.module.scss';
import PropTypes from 'prop-types';
import {auth} from "../../services/auth.service";

const ProtectedComponent = ({children, action, align}) => {

  const signedIn = auth.current();

  const message = (
    <div className={`${styles.wrapper} ${styles[`a-${align}`]}`}>
      <p className={styles.message}>You must be logged in to {action}</p>
    </div>
  )

  return signedIn == null ? message : children
};

ProtectedComponent.propTypes = {
  action: PropTypes.string,
  align: PropTypes.oneOf(['l', 'm', 'r'])
}

ProtectedComponent.defaultProps = {
  action: 'do this',
  align: 'l'
}

export default ProtectedComponent;
