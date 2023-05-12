import React from 'react';
import InputLabel from "../../input/inputLabel/InputLabel.component";
import {auth} from "../../../services/auth.service";
import withUser from "../../withUser/WithUser.component";
import InputText from "../../input/inputText/InputText.component";
import Button from "../../button/Button.component";
import MessageBanner from "../../messageBanner/MessageBanner.component";
import useAuth from "../../../hooks/auth.hook";

const SignIn = ({ userContext }) => {

  const [ handleChange, submit, busy, failed ] = useAuth(auth.signin(userContext), '/', {username:'', password:''});

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
        <Button disabled={busy} loading={busy} colour="primary" type="submit">Sign In</Button>
      </form>
    </div>
  );
};

export default withUser(SignIn);
