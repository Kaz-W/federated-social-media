import React, {Component} from 'react';
import styles from './Comment.module.scss';
import api from "../../utils/api";
import * as PropTypes from "prop-types";
import SpinnerWhile from "../spinner/SpinnerWhile.component";
import Button from "../button/Button.component";
import CommentCreator from "../commentCreator/CommentCreator.component";
import MessageBanner from "../messageBanner/MessageBanner.component";

import ActionsButton from "../actionsButton/ActionsButton.component";
import ViewProfileAction from "../actionsButton/ViewProfileAction.component";
import MenuSeparator from "../menu/menuSeparator/MenuSeparator.component";
import Markdown from "../markdown/Markdown.component";
import FormatDate from "../../services/date.service";
import {Link} from "react-router-dom";
import LikeButton from "../likesButton/LikeButton.component";
import ProfileImage from "../profileImage/ProfileImage.component";
import CommentEditor from "../commentEditor/CommentEditor.component";
import MenuItem from "../menu/menuItem/MenuItem.component";
import DeleteAction from "../actionsButton/DeleteAction.component";

const DeletedComment = () => {
  return (<MessageBanner status="neutral" size="slim"><i className="far fa-trash-alt"/>&nbsp;&nbsp;Comment Deleted</MessageBanner>);
};

/**
 * Component for recursively displaying comments.
 *
 * How this component will actually work is by receiving the url for the target comment, and make a single request
 * to get the comment content (which includes the links for child comments - and creates child components).
 */
class Comment extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoadingChildComments: true,
      childComments: null,
      isCreatorShowing: false,
      isEditShowing: false,
      deleted: false,
      failure: null,
      comment: props.comment,
      username: 'Loading...'
    };

    this.toggleCreatorVisibility = this.toggleCreatorVisibility.bind(this);
    this.getChildComments = this.getChildComments.bind(this);
    this.updateComment = this.updateComment.bind(this)
    this.toggleEdit = this.toggleEdit.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  async componentDidMount() {
    this.getChildComments();
    this.getUserInfo();
  }

  async getChildComments() {
    const { comment } = this.props;

    let res = await api.relay.get(comment._links.childComments.href);

    if (res.ok) {
      const childComments = res.data._embedded.commentList;
      this.setState({ childComments: childComments});
    }

    this.setState({ isLoadingChildComments: false });
  }

  getUserLink() {
    const { _links } = this.props.comment;
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
      this.setState({failed: `Couldn't delete comment (${errorMessage})`});
    }
  }

  updateComment(newComment) {
    this.setState(state => ({ comment: {...state.comment, ...newComment}, isEditShowing: false }));
  }

  renderChildComments() {
    const { childComments } = this.state;
    const { postId, userContext } = this.props;

    if (childComments === null) {
      return <MessageBanner status='error'>Couldn't load comments.</MessageBanner>
    }

    return childComments.map(comment => <Comment key={comment.id} depth={1} comment={comment} postId={postId} userContext={userContext} />)
  }

  generateComment() {
    const { isEditShowing, comment } = this.state;
    if (isEditShowing) {
      return <CommentEditor comment={comment} onEdit={this.updateComment} />;
    } else {
      return (<Markdown>{comment?.commentContent}</Markdown>);
    }
  }

  toggleCreatorVisibility() {
    const currentVal = this.state.isCreatorShowing;
    this.setState({ isCreatorShowing: !currentVal });
  }

  toggleEdit() {
    this.setState(state => ({isEditShowing: !state.isEditShowing}));
  }

  render() {
    const { comment, postId, userContext } = this.props;
    const { isLoadingChildComments, isCreatorShowing, username, profileImageURL, deleted, failed } = this.state;

    if (deleted) return <DeletedComment />;

    if ((!isLoadingChildComments && comment == null) || failed) {
      return <MessageBanner status='error'>{failed ?? "Failed to load comment."}</MessageBanner>
    }

    const createdDate = new Date(comment.createdTime);
    const modifiedDate = new Date(comment.modifiedTime);
    const displayDate = FormatDate.format(createdDate, modifiedDate);

    const owner = userContext.user ? userContext.user.id === comment.userId : false;
    const currentUserUrl = userContext?.user?._links?.self?.href;
    const userURI = encodeURIComponent(this.getUserLink());    // URI to the commenter's profile

    return (
      <div className={styles.comment}>
        <SpinnerWhile isTrue={() => isLoadingChildComments}>
          <div className={styles.comment_header}>
            <ProfileImage imageURL={profileImageURL} username={username} size={"small"} />
            <Link to={`/profile/${userURI}`} className={styles.comment_author}>{username}</Link>
            <p className={styles.comment_date}>{displayDate}</p>
          </div>
          <div className={styles.comment_content}>

            {this.generateComment()}

            <div className={styles.comment_actions}>
              <LikeButton userUrl={currentUserUrl} votable={comment} size="small" />
              <Button onClick={this.toggleCreatorVisibility} size='small'>
                <i className="far fa-comment-dots"/>&nbsp;<i>Reply</i>
              </Button>
              <ActionsButton size="small">
                <ViewProfileAction userURI={userURI} />
                <MenuSeparator />
                {owner && <MenuItem onClick={this.toggleEdit}>Edit</MenuItem>}
                {owner && <DeleteAction contentUrl={comment._links.self.href} onDelete={this.onDelete} />}
              </ActionsButton>
            </div>
            {isCreatorShowing &&
              <CommentCreator url={comment._links.childComments.href} submitHook={this.getChildComments} postId={postId} />
            }
            {this.renderChildComments()}
          </div>
        </SpinnerWhile>
      </div>
    );
  }
}

Comment.propTypes = {
  depth: PropTypes.number.isRequired,
  comment: PropTypes.object.isRequired,
  postId: PropTypes.string.isRequired,
  userContext: PropTypes.object.isRequired
}

export default Comment;
