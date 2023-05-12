import React from 'react';
import Spinner from "./Spinner.component";

const SpinnerWhile = ({ isTrue, children }) => {
  if (isTrue()) {
    return <Spinner />;
  } else {
    return children;
  }
};

export default SpinnerWhile;
