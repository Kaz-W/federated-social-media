import React from "react";
import styles from './AuthHeader.module.scss';

export default function AuthHeader({ children, title, subtitle }) {
  return (
    <div className={styles.auth_header}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.shelf}>
        <h3 className={styles.subtitle}>{subtitle}</h3>
        {children}
      </div>
    </div>
  )
}
