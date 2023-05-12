import React from 'react';
import styles from './Columns.module.scss';

const Columns = ({ children, amount }) => {
  const columns = [2, 3, 4];

  if (!columns.includes(amount)) {
    amount = 2;
  }

  const c = `c-${amount}`;

  return (
    <div className={`${styles.columns} ${styles[c]}`}>
      {children}
    </div>
  );
};

export default Columns;
