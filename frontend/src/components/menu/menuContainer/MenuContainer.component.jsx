import React from 'react';
import styles from './MenuContainer.module.scss'
import * as PropTypes from 'prop-types';
import {Menu} from 'reakit/Menu';

const MenuContainer = ({children, label, ...rest}) => {
  return (
    <Menu aria-label={label} {...rest} className={styles.menu_container}>
      {children}
    </Menu>
  );
};

MenuContainer.propTypes = {
  label: PropTypes.string.isRequired
};

export default MenuContainer;
