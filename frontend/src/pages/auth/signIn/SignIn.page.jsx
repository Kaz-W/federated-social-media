import React from 'react';
import styles from './SignIn.module.scss';
import Container from "../../../components/container/Container.component";
import {Link} from "react-router-dom";
import AuthHeader from "../../../components/auth/authHeader/AuthHeader.component";
import SignIn from "../../../components/auth/signIn/SignIn.component";
import Page from "../../../components/page/Page.component";


function SignInPage() {
  return (
    <Page>
      <Container size='sm'>
        <div className={styles.sign_in_padding}>
          <AuthHeader title='Sign In.' subtitle='Welcome back!'>
            <p>Don't have an account? <Link to='/auth/sign-up'>Sign up</Link>.</p>
          </AuthHeader>
          <SignIn />
        </div>
      </Container>
    </Page>
  );
}

export default SignInPage;
