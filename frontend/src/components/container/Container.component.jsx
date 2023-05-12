import React from 'react';
import styles from './Container.module.scss';

export default function Container({ children, size }) {
  const sizes = ['sm', 'md'];

  if (!sizes.includes(size))
  {
    size = 'md';
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.content} ${styles[size]}`}>
        {children}
      </div>
    </div>
  )
}
