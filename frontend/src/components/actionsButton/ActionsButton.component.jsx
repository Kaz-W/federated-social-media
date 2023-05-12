import React, {Children, cloneElement, isValidElement} from 'react';
import styles from './ActionsButton.module.scss';
import PropTypes from 'prop-types';
import Button from "../button/Button.component";
import {
  MenuButton,
  useMenuState,
} from "reakit/Menu";
import MenuContainer from "../menu/menuContainer/MenuContainer.component";


const ActionsButton = ({children, label, size}) => {
  const menu = useMenuState();

  const elements = Children.map(children, (child) => {
    // Inject the menu state into the props of the children.
    return isValidElement(child) ? cloneElement(child, {...child.props, ...menu}) : child;
  });

  return (
    <div>
      <Button size={size} as={MenuButton} {...menu} className={styles.button}>{label}</Button>
      <MenuContainer label="Menu" {...menu}>
        {elements}
      </MenuContainer>
    </div>
  );
};

ActionsButton.propTypes = {
  label: PropTypes.element,
  size: PropTypes.oneOf(["normal", "small"])
};

ActionsButton.defaultProps = {
  label: <><i className="fas fa-chevron-down"/>&nbsp;<i>More</i></>,
  size: "normal"
}

export default ActionsButton;
