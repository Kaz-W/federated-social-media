import React, {Component} from 'react';
import styles from './Explorer.module.scss';
import ForumList from "./forumList/ForumList.component";
import SubforumList from "./subforumList/SubforumList.component";
import api from "../../utils/api";
import {withRouter} from "react-router-dom";

class Explorer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedForum: null,
      selectedSubforum: null
    }

    this.onSelectForum = this.onSelectForum.bind(this);
    this.onSelectSubforum = this.onSelectSubforum.bind(this);
    this.onClear = this.onClear.bind(this);
  }

  async componentDidMount() {
    const { selectedSubforumLink } = this.props.match?.params;
    const decodedLink = selectedSubforumLink ? decodeURIComponent(selectedSubforumLink) : null;
    const sel = await this.tryReconstructSelection(decodedLink);

    if (sel) {
      const {selectedForum, selectedSubforum} = sel;
      this.setState({selectedForum, selectedSubforum});
      this.props.onSelect(selectedSubforum);
    }
  }

  async tryReconstructSelection(selectedSubforumLink) {
    // Don't reconstruct if the link is missing.
    if (!selectedSubforumLink) return;

    // Get selected subforum.
    const subforumRes = await api.relay.get(selectedSubforumLink);
    if (!subforumRes.ok) return;

    const selectedSubforum = subforumRes.data;

    // Get selected forum.
    const forumRes = await api.relay.get(selectedSubforum._links.forum.href);
    if (!forumRes.ok) return;

    const selectedForum = forumRes.data;

    return { selectedForum, selectedSubforum };
  }

  onSelectForum(forum) {
    this.setState({selectedForum: forum});
  }

  onSelectSubforum(subforum) {
    this.setState({selectedSubforum: subforum});

    // Update the owning component that a selection change has happened.
    this.props.onSelect(subforum);
  }

  onClear() {
    this.setState({ selectedForum: null });
  }

  render() {
    const { selectedForum, selectedSubforum } = this.state;

    return (
      <div className={styles.explorer}>
        {selectedForum &&
          <SubforumList
            selectedForum={selectedForum}
            selectedSubforum={selectedSubforum}
            onSelectSubforum={this.onSelectSubforum}
            onClear={this.onClear} />
        }
        <ForumList disabled={selectedForum != null} onSelectForum={this.onSelectForum} />
      </div>
    );
  }
}

// Wrap with Router HOC so the props get access to match, history etc.
export default withRouter(Explorer);
