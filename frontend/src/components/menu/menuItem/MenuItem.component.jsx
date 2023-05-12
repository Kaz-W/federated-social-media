import React from 'react';
import styles from './MenuItem.module.scss';

import {MenuItem as MenuItemBase} from "reakit/Menu";
import Button from "../../button/Button.component";

const MenuItem = ({children, ...rest}) => {
  return (
    <Button className={styles.menu_item} colour={'invert'} as={MenuItemBase} {...rest}>
      {children}
    </Button>
  );
};

export default MenuItem;
