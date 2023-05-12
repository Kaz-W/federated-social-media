import React, {useEffect, useState} from 'react';
import styles from './LikeButton.module.scss';
import * as PropTypes from 'prop-types';
import Button from "../button/Button.component";
import api from "../../utils/api";

const LikeButton = ({ votable, userUrl, size }) => {

  const [ busy, setBusy ] = useState(false);
  const [ currentVote, setCurrentVote ] = useState('novote');
  const [ votes, setVotes ] = useState((votable.upvotes ?? 0) - (votable.downvotes ?? 0));

  useEffect(() => {
    // Look for users vote.
    if (!votable._userVotes || !userUrl) return;

    const userVote = votable._userVotes.find(vote => vote.user === userUrl);
    if (userVote) {
      setCurrentVote(userVote.isUpvote ? 'upvote' : 'downvote');
    }
  }, []);

  async function vote(targetVote) {
    setBusy(true);

    let newVote = null;
    if (currentVote === targetVote) {
      // Undoing a vote.
      targetVote = 'novote';
    } else {
      // Doing a vote.
      newVote = targetVote === 'upvote';
    }

    const res = await api.relay.put(`${votable?._links?.self?.href}/vote`, {isUpvote: newVote});

    let newVotes = votes;

    if (res.ok) {
      // Update the vote display.
      if (currentVote === 'upvote') {
        newVotes--;
      } else if (currentVote === 'downvote') {
        newVotes++;
      }

      if (targetVote === 'upvote') {
        newVotes++;
      } else if (targetVote === 'downvote') {
        newVotes--;
      }

      setCurrentVote(targetVote);
      setVotes(newVotes);
    }

    setBusy(false);
  }

  function getColouration() {
    if (votes > 0) {
      return styles.count_positive;
    } else if (votes < 0) {
      return styles.count_negative;
    } else {
      return styles.count_neutral;
    }
  }

  const sizeClass = styles[`s_${size}`] ?? '';

  return (
    <div className={styles.like_wrapper}>
      <Button
        onClick={() => vote('upvote')}
        className={styles[currentVote]}
        disabled={busy || !userUrl}
        size={size}
        aria-label="upvote"
      >
        <i className="fas fa-arrow-up"/>
      </Button>
      <div className={`${getColouration()} ${sizeClass}`}>{votes}</div>
      <Button
        onClick={() => vote('downvote')}
        className={styles[currentVote]}
        disabled={busy || !userUrl}
        size={size}
        aria-label="downvote"
      >
        <i className="fas fa-arrow-down"/>
      </Button>
    </div>
  );
};

LikeButton.propTypes = {
  votable: PropTypes.object.isRequired,
  userUrl: PropTypes.string.isRequired,
  size: PropTypes.oneOf(["small", "normal"])
}

LikeButton.defaultProps = {
  size: "normal"
}

export default LikeButton;
