import React, {Component} from 'react';
import Post from "./Post.component";
import Button from "../button/Button.component";
import styles from "../posts/Post.module.scss";

/**
 * Stateless component for displaying an empty post list by default.
 * May be overridden (as seen in the Feed component).
 */
const EmptyList = () => {
    return (
      <div className={styles.empty_list}>
          <p>No posts yet...</p>
      </div>
    );
};

/**
 * Component to fetch and display the posts.
 */
class Posts extends Component {

    constructor(props) {
        super(props);
        this.limit = props.limit ?? 10;
        this.state = {
            totalCount: 0,
            fullPostList: [],
            postList: [],
            shownPosts: this.limit,
        };

        if (props.data) {   // update state if props.data given
            this.state = { ...this.state,
                totalCount: props.data.length,
                fullPostList: props.data,
                postList: props.data.slice(0, this.limit),
            };
        }
        this.viewMore = this.viewMore.bind(this);
    }

    viewMore(event) {
        event.preventDefault();
        this.setState({
            shownPosts: this.state.shownPosts + this.limit,
            postList: this.state.fullPostList.slice(0, this.state.shownPosts + this.limit)
        });
    }

    render() {
        const { totalCount, shownPosts, postList } = this.state;

        if (totalCount === 0) {
            return <EmptyList />
        }

        return (
          <div>
              {postList.map(post => <Post key={post.id} post={post} />)}
              {totalCount > shownPosts &&
              <Button className={styles.load_btn} colour={'normal'} size={'normal'} onClick={this.viewMore}>Load more...</Button> }
          </div>
        );
    }

}

export default Posts;
