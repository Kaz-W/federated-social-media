import React from 'react';
import styles from './SignUp.module.scss';
import Container from "../../../components/container/Container.component";
import {Link} from "react-router-dom";
import Columns from "../../../components/columns/Columns.component";
import AuthHeader from "../../../components/auth/authHeader/AuthHeader.component";
import SignUp from "../../../components/auth/signUp/SignUp.component";
import Page from "../../../components/page/Page.component";

const SignUpPage = () => {
  return (
    <Page>
      <Container>
        <div className={styles.sign_up_padding}>
          <Columns amount={2}>
            <div>
              <AuthHeader title='Sign Up.' subtitle='Lorem ipsum dolor sit amet, consectetur adipiscing elit.'>
                <p>Already have an account? <Link to='/auth/sign-in'>Sign in</Link>.</p>
              </AuthHeader>
            </div>
            <div>
              <SignUp />
            </div>
          </Columns>
        </div>
      </Container>
    </Page>
  );
}

export default SignUpPage;
