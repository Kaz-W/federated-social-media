// Node module: @loopback/example-todo-jwt
import {TokenServiceBindings, UserServiceBindings} from "@loopback/authentication-jwt";
import {get, param, post, requestBody, SchemaObject} from "@loopback/rest";
import {authenticate, TokenService} from "@loopback/authentication";
import {inject, service} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {repository} from "@loopback/repository";
import {CommentRepository, MyUserService, PostRepository, UserRepository} from "../../index";
import getDomain from "../../domain";


export class UpvoteController {
  constructor(
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(PostRepository) protected postRepository: PostRepository,
    @repository(CommentRepository) protected commentRepository: CommentRepository
  ) {
  }

  @authenticate('jwt')
  @get('/servers/{serverId}/posts/{postId}/myVote', {
    responses: {
      '200': {
        description: 'Return vote status on post',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async myVote(
    @param.path.string('serverId') serverId: string,
    @param.path.string('postId') postId: string,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<number> {
    let post = await this.postRepository.findById(postId);
    let user_url = getDomain() + "/api/users/" + currentUserProfile["id"]
    if (post["_userVotes"].findIndex((i: { [x: string]: any; }) => (i["user"] === user_url && i["isUpvote"])) >= 0) return 1
    if (post["_userVotes"].findIndex((i: { [x: string]: any; }) => (i["user"] === user_url && !i["isUpvote"])) >= 0) return -1
    return 0
  }

  @authenticate('jwt')
  @get('/servers/{serverId}/comments/{commentId}/myVote', {
    responses: {
      '200': {
        description: 'Return vote status on comment',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async myCommentVote(
    @param.path.string('serverId') serverId: string,
    @param.path.string('commentId') commentId: string,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<number> {
    let comment = await this.commentRepository.findById(commentId);
    let user_url = getDomain() + "/api/users/" + currentUserProfile["id"];
    if (comment["_userVotes"].findIndex((i: { [x: string]: any; }) => (i["user"] === user_url && i["isUpvote"])) >= 0) return 1
    if (comment["_userVotes"].findIndex((i: { [x: string]: any; }) => (i["user"] === user_url && !i["isUpvote"])) >= 0) return -1
    return 0
  }
}