import React, {Component} from 'react';
import image404 from'../../images/404.gif';
import styles from './NotFound.module.scss';
import {Link, withRouter} from "react-router-dom";
import Page from "../../components/page/Page.component";

class NotFound extends Component {

  constructor(props) {
    super(props);
    this.header = props.header ?? "Page Not Found";
  }

  render() {
    return (
      <Page>
        <div className={styles.not_found}>
          <h1>404</h1>
          <h3>{this.header}</h3>
          <Link onClick={() => { this.props.history.goBack(); }}><h5>Go Back</h5></Link>
          <Link to='/'><h5>Go Home</h5></Link>
          <img src={image404} alt="You're lost"/>
        </div>
      </Page>
    );
  }
}

export default withRouter(NotFound);
