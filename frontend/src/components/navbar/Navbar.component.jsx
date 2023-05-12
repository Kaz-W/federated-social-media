import React from 'react';
import {Link, withRouter} from "react-router-dom";
import logo from '../../images/Biotin.png'
import styles from './Navbar.module.scss';
import {auth} from "../../services/auth.service";
import withUser from "../withUser/WithUser.component";
import ActionsButton from "../actionsButton/ActionsButton.component";
import MenuItem from "../menu/menuItem/MenuItem.component";
import Button from "../button/Button.component";

const Navbar = ({ userContext, history }) => {

  function generateUserLinks() {
    if (userContext.user) {
      const isAdmin = userContext.user.serverRole ? userContext.user.serverRole === 'admin' : false;
      return (
        <>
          <p>Hello, {userContext.user.username}</p>
          <ActionsButton label={<><i className="fas fa-cog"/>&nbsp;&nbsp;<i>Settings</i></>}>
            <MenuItem onClick={auth.signout(userContext)}>Sign Out</MenuItem>
            <MenuItem onClick={() => history.push('/profile')}>View Profile</MenuItem>
            {isAdmin && <MenuItem onClick={() => history.push('/admin')}>Admin</MenuItem>}
          </ActionsButton>
        </>
      );
    } else {
      return (
        <>
          <Button onClick={() => history.push('/auth/sign-in')} colour={"none"}><i>Sign In</i></Button>
          <Button onClick={() => history.push('/auth/sign-up')} colour={"primary"}><i>Sign Up</i></Button>
        </>
      );
    }
  }

  return (
    <div className={styles.navbar}>
      <Link to='/feed' className={styles.logo}><img src={logo} alt="logo"/></Link>
      <nav className={styles.auth_links}>
        {generateUserLinks()}
      </nav>
    </div>
  );
};

export default withRouter(withUser(Navbar));
