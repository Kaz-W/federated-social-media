import React from 'react';
import PropTypes from 'prop-types';
import MenuItem from "../menu/menuItem/MenuItem.component";
import {useHistory} from "react-router-dom";

/**
 * Button that links to a users profile, meant to be used in an ActionsButton wrapper.
 */
const ViewProfileAction = ({ userURI, ...rest }) => {

  let history = useHistory();

  function handleViewProfile(e) {
    e.preventDefault();
    history.push(`/profile/${userURI}`);
  }

  return (
    <MenuItem {...rest} onClick={handleViewProfile}>View Profile</MenuItem>
  );
};

ViewProfileAction.propTypes = {
  userURI: PropTypes.string.isRequired
};

export default ViewProfileAction;
