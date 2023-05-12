import {injectable} from "@loopback/core";

interface Votable {
  upvotes: number,
  downvotes: number,
  _userVotes: UserVote[]
}

interface UserVote {
  isUpvote: boolean,
  user: string
}

enum VoteMode {
  Upvote = "upvote",
  Novote = "novote",
  Downvote = "downvote"
}

@injectable()
export class VotingService {

  updateVotable(votable: Votable, userUrl: string, isUpvote: boolean): Votable {
    const currentVote = votable._userVotes?.find(vote => vote.user === userUrl);

    // Initialise votable if database is old.
    if (votable.downvotes === undefined) votable.downvotes = 0;
    if (votable.upvotes === undefined) votable.upvotes = 0;
    if (votable._userVotes === undefined) votable._userVotes = [];

    const currentVoteMode: VoteMode = currentVote
      ? (currentVote.isUpvote ? VoteMode.Upvote : VoteMode.Downvote)
      : VoteMode.Novote;

    const targetVoteMode: VoteMode = isUpvote !== null
      ? (isUpvote ? VoteMode.Upvote : VoteMode.Downvote)
      : VoteMode.Novote;

    // Do nothing, vote is already correct.
    if (currentVoteMode === targetVoteMode) return votable;

    // Remove vote record if there is an existing one.
    if (currentVoteMode !== VoteMode.Novote) {
      votable._userVotes.splice(votable._userVotes.findIndex(i => (i["user"] === userUrl)), 1)
    }

    // Undo old votes.
    if (currentVoteMode === VoteMode.Downvote) {
      votable.downvotes--;
    } else if (currentVoteMode === VoteMode.Upvote) {
      votable.upvotes--;
    }

    // Add new votes.
    if (targetVoteMode === VoteMode.Upvote) {
      votable.upvotes++;
    } else if (targetVoteMode === VoteMode.Downvote) {
      votable.downvotes++;
    }

    if (targetVoteMode !== VoteMode.Novote) {
      // Add new vote record.
      votable._userVotes.push({isUpvote, user: userUrl});
    }

    return votable;
  }
}
