import React from 'react';
import {UserContext} from "../../utils/user.context";

/**
 * Give the wrapped component access to the current user.
 */
const withUser = (WrappedComponent) => {
  return props => {
    return (
      <UserContext.Consumer>
        {(userContext) => (<WrappedComponent userContext={userContext} {...props} />)}
      </UserContext.Consumer>
    );
  };
};

export default withUser;
