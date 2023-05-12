import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from "../menu/menuItem/MenuItem.component";

/**
 * Button that bans a user, meant to be used in an ActionsButton wrapper.
 */
const BanAction = ({ userId, ...rest }) => {

  function handleBan(e) {
    e.preventDefault();

    // TODO (BC) Ban people.
    console.log(`Banning user ${userId}`);
  }

  return (
    <MenuItem {...rest} colour={'danger'} onClick={handleBan}>Ban User</MenuItem>
  );
};

BanAction.propTypes = {
  userId: PropTypes.string.isRequired
};

export default BanAction;
