import React from 'react';
import InputLabel from "../../input/inputLabel/InputLabel.component";
import {auth} from "../../../services/auth.service";
import useAuth from "../../../hooks/auth.hook";
import withUser from "../../withUser/WithUser.component";
import Button from "../../button/Button.component";
import InputText from "../../input/inputText/InputText.component";
import MessageBanner from "../../messageBanner/MessageBanner.component";

const SignUp = ({ userContext }) => {

  const defaults = {username:'', password:'', password_reentered: ''};
  const [ handleChange, submit, busy, failed ] = useAuth(auth.signup(userContext), '/', defaults);

  return (
    <div>
      {failed && <MessageBanner status="error">{failed}</MessageBanner>}
      <form onSubmit={submit}>
        <InputLabel htmlFor="username">
          Username
          <InputText onChange={handleChange("username")}/>
        </InputLabel>
        <InputLabel htmlFor="password">
          Password
          <InputText type="password" onChange={handleChange("password")}/>
        </InputLabel>
        <InputLabel htmlFor="password">
          Re-enter Password
          <InputText type="password" onChange={handleChange("password_reentered")}/>
        </InputLabel>
        <Button disabled={busy} loading={busy} colour="primary" type="submit">Sign Up</Button>
      </form>
    </div>
  );
};

export default withUser(SignUp);
