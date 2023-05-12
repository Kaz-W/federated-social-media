import React, {Component} from 'react';
import styles from './Comments.module.scss';
import api from "../../utils/api";
import * as PropTypes from "prop-types";

import Comment from "./Comment.component";
import CommentCreator from "../commentCreator/CommentCreator.component";
import Spinner from "../spinner/Spinner.component";
import MessageBanner from "../messageBanner/MessageBanner.component";
import withUser from "../withUser/WithUser.component";

/**
 * Component for initializing the root comments of a post.
 */
class Comments extends Component {

    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            comments: null,
        };

        if (props.url === undefined) {
            console.error(`Comments component for Post ${props.postId} has no URL!`);
        }

        this.reloadComments = this.reloadComments.bind(this);
    }

    async componentDidMount() {
        await this.reloadComments();
    }

    async reloadComments() {
        const {url, postId} = this.props;

        this.setState({isLoading: true, comments: null});

        const res = await api.relay.get(url);

        if (res.ok) {
            const comments = res.data._embedded.commentList;
            // const count = res.data._embedded.totalCount;
            this.setState({ comments: comments });
        } else {
            console.error(`Failed to load comments for post ${postId}.`);
        }

        this.setState({isLoading: false});
    }

    generateComments() {
        const {isLoading, comments} = this.state;
        const {postId, userContext} = this.props;

        if (isLoading === true) {
            return <Spinner/>;
        } else if (comments == null) {
            return <MessageBanner status='error'>Failed to load comments</MessageBanner>
        } else if (comments.length === 0) {
            return <p>None, Start the Conversation...</p>
        }

        return comments.reverse().map(comment =>
            <Comment key={comment.id} depth={1} comment={comment} postId={postId} userContext={userContext}/>
        );
    }

    render() {
        const {url, postId} = this.props;
        const comments = this.generateComments();

        return (
            <div className={styles.comments}>
                <CommentCreator url={url} postId={postId} submitHook={this.reloadComments}/>
                {comments}
            </div>
        );
    }
}

Comments.propTypes = {
    url: PropTypes.string.isRequired,
    postId: PropTypes.string.isRequired
}

export default withUser(Comments);
