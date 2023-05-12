import React from 'react';
import {auth} from "../../services/auth.service";
import {Route, Redirect} from "react-router-dom";

const ProtectedRoute = ({component: Component, ...other}) => {
  const user = auth.current();
  return (
    <Route {...other} render={props => {
      return !user
        ? <Redirect to='/auth/sign-in' />
        : <Component {...props} />
    }}/>
  );
};

export default ProtectedRoute;
