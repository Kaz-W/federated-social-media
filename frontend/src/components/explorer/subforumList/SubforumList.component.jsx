import React, {Component} from 'react';
import styles from './SubforumList.module.scss';
import api from "../../../utils/api";
import Subforum from "../subforum/Subforum.component";
import MessageBanner from "../../messageBanner/MessageBanner.component";
import Spinner from "../../spinner/Spinner.component";
import SubforumCreator from "../../subforumCreator/SubforumCreator.component";

class SubforumList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      subforums: null,
      isLoading: true
    }

    this.reload = this.reload.bind(this);
  }

  async componentDidMount() {
    await this.reload();
  }

  async reload() {
    const { _links } = this.props.selectedForum;

    this.setState({subforums: null, isLoading: true});

    const res = await api.relay.get(_links.subforums.href);
    if (res.ok) {
      this.setState({subforums: res.data._embedded.subforumList});
    } else {
      console.error(res.err ?? "Couldn't fetch the subforums");
    }

    this.setState({ isLoading: false });
  }

  render() {
    const { selectedForum, onClear, onSelectSubforum, selectedSubforum } = this.props;
    const { subforums, isLoading } = this.state;

    // Set the content of the list. Doing it so it's all within the container prevents jump-in.
    let contentList;
    if (isLoading) {
      contentList = <Spinner />;
    } else if (subforums != null) {
      contentList = subforums
        .map(subforum =>
          <Subforum
            key={subforum._links.self.href}
            subforum={subforum}
            selectedSubforumId={selectedSubforum?.id}
            onSelect={onSelectSubforum} />);
    } else {
      contentList = <MessageBanner status='error'>Couldn't load subforums</MessageBanner>;
    }

    return (
      <div className={styles.subforum_list_container}>
          <p className={styles.header} onClick={onClear}>
            <i className="fas fa-chevron-left"/>&nbsp;&nbsp;
            {selectedForum.forumName}
          </p>
        <div className={styles.subforum_list}>
          {contentList}
        </div>
        <SubforumCreator forum={selectedForum} onCreate={this.reload} />
      </div>

    );
  }
}

export default SubforumList;
