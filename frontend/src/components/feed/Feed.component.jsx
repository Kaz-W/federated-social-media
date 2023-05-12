import React, {useEffect, useState} from 'react';
import styles from './Feed.module.scss';
import Container from "../container/Container.component";
import PostCreator from "../postCreator/PostCreator.component";
import Posts from "../posts/Posts.component";
import api from "../../utils/api";
import MessageBanner from "../messageBanner/MessageBanner.component";
import Spinner from "../spinner/Spinner.component";

/**
 * Stateless component for displaying an empty feed.
 */
const BlankFeed = () => {
  return (
    <div className={styles.blank_feed}>
      <p className={styles.main_text}>No subforum to show</p>
      <p className={styles.sub_text}>Select one from the explorer</p>
    </div>
  );
};

/**
 * Stateless component that shows when there are no posts to display.
 */
const EmptyFeed = () => {
  return (
    <div className={styles.empty_feed}>
      <i className="fas fa-heart-broken"/>
      <p>No posts yet...</p>
    </div>
  );
};

/*
* The feed component houses the Posts and PostCreator component, and takes care of post data.
*
* This component is a requirement to allow the PostCreator and Posts components to talk to each other.
* */
const Feed = ({ subforum }) => {

  const [ postList, setPostList ] = useState(null);
  const [ isLoading, setIsLoading ] = useState(true);
  const [ failed, setFailed ] = useState(null);

  useEffect(() => {
    reload(subforum);
  }, [subforum]);

  async function reload(sf) {

    if (!sf) return;
    setIsLoading(true);

    let res = await api.relay.get(sf._links.posts.href);

    if (res.ok) {
      setPostList(res.data._embedded.postList);
    } else {
      setFailed(res.err ?? "Failed to get posts");
    }

    setIsLoading(false);
  }

  function generatePostList() {
    if (!subforum) {
      return <BlankFeed />;
    } else if (isLoading) {
      return <Spinner />
    }

    let posts;
    if (!postList) {
      return <></>;
    } else if (postList.length === 0) {
      posts = <EmptyFeed />;
    } else {
      posts = <Posts data={postList}/>;
    }

    return posts;
  }

  return (
    <div className={styles.feed}>
      <Container>
        <PostCreator disabled={subforum === null} subforumObject={subforum} submitHook={reload} />
      </Container>
      <Container>
        {failed && <MessageBanner status='error'>Couldn't load posts - {failed}</MessageBanner>}
        {generatePostList()}
      </Container>
    </div>
  );

}

export default Feed;
