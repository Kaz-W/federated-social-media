import React from 'react';
import styles from './MenuSeparator.module.scss';
import {MenuSeparator as MenuSeparatorBase} from "reakit";

const MenuSeparator = (props) => {
  return (
    <MenuSeparatorBase className={styles.menu_separator} {...props} />
  );
};

export default MenuSeparator;
