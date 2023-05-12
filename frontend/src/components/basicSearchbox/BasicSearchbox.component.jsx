import React, {useState} from 'react';
import * as PropTypes from "prop-types";
import InputText from "../input/inputText/InputText.component";
import Button from "../button/Button.component";

const BasicSearchbox = ({ onSubmit, busy }) => {

  const [ data, setData ] = useState('');

  function handleChange(e) {
    setData(e.target.value);
  }

  return (
    <div>
      <InputText id='searchbox' onChange={handleChange} />
      <Button disabled={busy} loading={busy} onClick={() => onSubmit(data)}>Search</Button>
    </div>
  );
};

BasicSearchbox.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  busy: PropTypes.bool
}

BasicSearchbox.defaultProps = {
  busy: false
}

export default BasicSearchbox;
