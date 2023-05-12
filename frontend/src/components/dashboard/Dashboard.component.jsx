import React from "react";
import styles from './Dashboard.module.scss'
import Feed from "../feed/Feed.component";
import Explorer from "../explorer/Explorer.component";
import {withRouter} from "react-router-dom";

class Dashboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      subforum: null,
    };

    this.onLocationChange = this.onLocationChange.bind(this);
  }

  async onLocationChange(subforum) {
    this.setState({subforum});
    // Have to encode twice because of reasons.
    const encodedLink = encodeURIComponent(encodeURIComponent(subforum._links.self.href));
    this.props.history.push(`/feed/${encodedLink}`);
  }

  render() {
    return (
      <div className={styles.dashboard}>
        <div className={styles.side_bar_left}>
          <Explorer onSelect={this.onLocationChange} />
        </div>
        <div className={styles.main}>
          <Feed subforum={this.state.subforum} />
        </div>
        <div className={styles.side_bar_right}>
          {/* Unused space */}
        </div>
      </div>
    );
  }
}

export default withRouter(Dashboard);
