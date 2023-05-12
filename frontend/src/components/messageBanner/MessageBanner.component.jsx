import React from 'react';
import * as PropTypes from 'prop-types';
import styles from './MessageBanner.module.scss';

const MessageBanner = ({ children, status, size }) => {

  const statusStyle = styles[status] ?? styles.info; // Default is info.
  const sizeStyle = styles[size] ?? ''; // Default is empty.

  return (
    <div className={`${styles.message_banner} ${statusStyle} ${sizeStyle}`}>
      {children}
    </div>
  );
};

MessageBanner.propTypes = {
  status: PropTypes.oneOf(['info', 'error', 'neutral']),
  size: PropTypes.oneOf(['slim'])
}

export default MessageBanner;
