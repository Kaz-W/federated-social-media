import React, {Component} from 'react';
import styles from './Post.module.scss';
import * as PropTypes from "prop-types";
import api from "../../utils/api";

import Comments from "../comments/Comments.component";
import Button from "../button/Button.component";
import FormatDate from "../../services/date.service";
import Markdown from "../markdown/Markdown.component";
import ActionsButton from "../actionsButton/ActionsButton.component";
import withUser from "../withUser/WithUser.component";
import MenuItem from "../menu/menuItem/MenuItem.component";
import PostEditor from "../postEditor/PostEditor.component";
import {Link} from "react-router-dom";
import LikeButton from "../likesButton/LikeButton.component";
import ViewProfileAction from "../actionsButton/ViewProfileAction.component";
import MenuSeparator from "../menu/menuSeparator/MenuSeparator.component";
import ProfileImage from "../profileImage/ProfileImage.component";
import DeleteAction from "../actionsButton/DeleteAction.component";
import MessageBanner from "../messageBanner/MessageBanner.component";

const DeletedPost = () => {
  return (
    <MessageBanner status="neutral"><i className="far fa-trash-alt"/>&nbsp;&nbsp;Post Deleted</MessageBanner>
  );
};

class Post extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      isCommentsShowing: false,
      isEditShowing: false,
      deleted: false,
      failed: null,
      post: props.post
    };

    this.toggleComments = this.toggleComments.bind(this)
    this.toggleEdit = this.toggleEdit.bind(this);
    this.updatePost = this.updatePost.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  async componentDidMount() {
    await this.getUserInfo();
    this.setState({
      isLoading: false,
    });
  }

  getUserLink() {
    const { _links } = this.props.post;
    return _links?.user?.href;
  }

  async getUserInfo() {
    const userLink = this.getUserLink();

    if (userLink) {
      const res = await api.relay.get(userLink);
      if (res.ok) {
        const {username, profileImageURL} = res.data;
        this.setState({username, profileImageURL})
      }
      else {  // res not ok - unable to fetch
        this.setState({
          username: '[fetch-failed]',
          profileImageURL: ''
        });
      }
    } else {  // no user link
      this.setState({
        username: '[missing-href]',
        profileImageURL: ''
      });
    }
  }

  onDelete(success, errorMessage) {
    if (success) {
      this.setState({deleted: true});
    } else {
      this.setState({failed: `Couldn't delete post (${errorMessage})`});
    }
  }

  updatePost(newPost) {
    this.setState(state => ({ post: {...state.post, ...newPost}, isEditShowing: false }));
  }

  toggleComments() {
    this.setState(state => ({isCommentsShowing: !state.isCommentsShowing}));
  }

  toggleEdit() {
    this.setState(state => ({isEditShowing: !state.isEditShowing}));
  }

  generatePost() {
    const { isEditShowing } = this.state;
    const { post } = this.state;

    if (isEditShowing) {
      return <PostEditor post={post} onEdit={this.updatePost} />;
    } else {
      return (
        <>
          <h3 className={styles.title}>{post.postTitle}</h3>
          <Markdown allowHtml={true} className={styles.content}>{post.postContents}</Markdown>
        </>
      );
    }
  }

  render() {
    const { id, userId, createdTime, modifiedTime, _links } = this.state.post;
    const { userContext } = this.props;
    const { isCommentsShowing, failed, deleted } = this.state;

    if (deleted) return <DeletedPost />;

    const createdDate = new Date(createdTime);
    const modifiedDate = new Date(modifiedTime);

    let displayDate = FormatDate.format(createdDate, modifiedDate);

    const userURI = encodeURIComponent(this.getUserLink());
    const owner = userContext.user ? userContext.user.id === userId : false;

    const username = this.state.isLoading
      ? <p>Loading...</p>
      : this.state.username;
    const imageURL = this.state.isLoading
      ? ""
      : this.state.profileImageURL;

    return (
      <div className={styles.post}>
        <div className={styles.post_header}>
          <ProfileImage imageURL={imageURL} username={username}/>
          <div className={styles.header_details}>
            <Link to={`/profile/${userURI}`} className={styles.username}>{username}</Link>
            <p className={styles.post_date}>{displayDate}</p>
          </div>
        </div>

        {this.generatePost()}

        {failed && <MessageBanner size="slim" status="error">{failed}</MessageBanner>}
        <div className={styles.actions_container}>
          <LikeButton votable={this.state.post} userUrl={userContext.user?._links?.self?.href} />
          <Button onClick={this.toggleComments}><i className="far fa-comment-alt"/>&nbsp;<span>Comment</span></Button>
          <ActionsButton>
            <ViewProfileAction userURI={userURI} />
            <MenuSeparator />
            {owner && <MenuItem onClick={this.toggleEdit}>Edit</MenuItem>}
            {owner && <DeleteAction contentUrl={_links?.self?.href} onDelete={this.onDelete} />}
          </ActionsButton>
        </div>

        {isCommentsShowing &&
          <Comments url={_links?.comments?.href} postId={id} />
        }
      </div>
    );
  }
}

Post.propTypes = {
  post: PropTypes.object.isRequired
}

export default withUser(Post);
