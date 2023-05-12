import React, {Component} from 'react';
import styles from './ForumList.module.scss';
import api from "../../../utils/api";
import * as PropTypes from "prop-types";
import Forum from "../forum/Forum.component";
import Spinner from "../../spinner/Spinner.component";
import MessageBanner from "../../messageBanner/MessageBanner.component";
import ForumCreator from "../../forumCreator/ForumCreator.component";


class ForumList extends Component {

  constructor(props) {
    super(props);

    this.state = {
      forums: null,
      isLoading: true
    }

    this.reload = this.reload.bind(this);
  }

  async componentDidMount() {
    await this.reload();
  }

  async reload() {
    this.setState({forums: null, isLoading: true});

    const res = await api.get('/internal/allforums');
    if (res.ok) {
      this.setState({forums: res.data});
    }

    this.setState({isLoading: false});
  }

  render() {

    if (this.state.isLoading) {
      return <div className={styles.forum_list_container}><Spinner /></div>;
    }

    return (
      <div className={styles.forum_list_container}>
        <h2 className={styles.header}>Forums</h2>
        {this.state.forums
          ?.map(forum => <Forum
            key={forum._links.self.href}
            forum={forum}
            onSelect={this.props.onSelectForum}
            disabled={this.props.disabled}/>)
          ?? <MessageBanner status='error'>Couldn't load forums</MessageBanner>}
          <ForumCreator onCreate={this.reload} />
      </div>
    );
  }
}

ForumList.propTypes = {
  disabled: PropTypes.bool,
  onSelectForum: PropTypes.func.isRequired
}

export default ForumList;
