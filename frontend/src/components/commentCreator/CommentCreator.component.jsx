import React, {Component} from 'react';
import styles from './CommentCreator.module.scss';
import api from "../../utils/api";
import ProtectedComponent from "../protectedComponent/ProtectedComponent.component";
import InputText from "../input/inputText/InputText.component";
import * as PropTypes from "prop-types";
import withUser from "../withUser/WithUser.component";
import ProfileImage from "../profileImage/ProfileImage.component";

class CommentCreator extends Component {
  constructor(props) {
    super(props);

    let profileImageURL = "";
    if (props.userContext?.user) {
      profileImageURL = props.userContext.user.profileImageURL;
    }

    this.state = {
      comment: '',
      profileImageURL: profileImageURL
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.submitHook = this.props.submitHook;
  }

  // On form update, update the component state so it tracks the data in the form.
  handleChange(e) {
    this.setState({[e.target.id]: e.target.value})
  }

  // On form submit, don't reload the page, just get the data in state and send it.
  async handleSubmit(e) {
    e.preventDefault();

    // Package the data in a form the forums will understand it. (The same for now but could be different).
    const { comment } = this.state;
    const { postId } = this.props;
    let data = {
      // postId: postId,
      commentContent: comment,
      username: this.props.userContext.user.username
    }

    // Send the data using the api wrapper.
    const { url } = this.props;
    await api.relay.post(url, data);

    this.submitHook();
    this.setState({ comment: '' });
  }

  render() {
    const { comment, profileImageURL } = this.state;
    return (
      <ProtectedComponent action='comment'>
        <form className={styles.comment_creator} onSubmit={this.handleSubmit}>
          <ProfileImage imageURL={profileImageURL} size={"small"} />
          <InputText className={styles.comment_component} onChange={this.handleChange} id="comment" value={comment} placeholder="Comment..." />
        </form>
      </ProtectedComponent>
    );
  }
}

CommentCreator.propTypes = {
  url: PropTypes.string.isRequired,
  submitHook: PropTypes.func.isRequired,
  postId: PropTypes.string.isRequired,
  userContext: PropTypes.object
};

export default withUser(CommentCreator);
