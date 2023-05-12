import {
  /* inject, */
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import getDomain from "../domain";
import {Comment, Post, Subforum} from "../models";
import {repository} from "@loopback/repository";
import {PostRepository, SubforumRepository} from "../repositories";

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: CommentLinkerInterceptor.BINDING_KEY}})
export class CommentLinkerInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${CommentLinkerInterceptor.name}`;

  constructor(
    @repository(PostRepository) protected postRepository: PostRepository,
    @repository(SubforumRepository) protected subforumRepository: SubforumRepository,
  ) {
  }

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    // Add pre-invocation logic here
    let result = await next();

    switch (invocationCtx.methodName) {
      // Getting all comments
      case 'find':
        for (let comment of result) {
          comment = await this.addLinks(comment);
        }
        break;
      // Getting/posting/patching a single comment
      case 'findById':
      case 'create':
        let comment = result as Comment;
        result = this.addLinks(comment);
    }

    return result;
  }

  /**
   * Adds links to an individual Comment.
   * @param comment
   */
  private async addLinks(comment: Comment) {
    const domain = getDomain();
    const userDomain = comment.userDomain ?? domain;
    let post: Post;
    let subforum: Subforum;

    comment._links = {
      self: {href: `${domain}/api/comments/${comment.id}`},
      user: {href: `${userDomain}/api/users/${comment.userId}`},
      post: {href: `${domain}/api/posts/${comment.postId}`},
      comments: {href: `${domain}/api/posts/${comment.postId}/comments`},
      childComments: {href: `${domain}/api/comments/${comment.id}/comments`}
    };

    // add the parent comment only if it exists
    if (comment.parentCommentId) {
      comment._links.parentComment = {href: `${domain}/api/comments/${comment.parentCommentId}`};
    }
    // add a subforum, then forum href only if they exist
    if (comment.postId) {
      post = await this.postRepository.findById(comment.postId);
      comment._links.subforum = {href: `${domain}/api/subforums/${post?.subforumId}`};

      if (post?.subforumId) {
        subforum = await this.subforumRepository.findById(post.subforumId);
        comment._links.forum = {href: `${domain}/api/forums/${subforum?.forumId}`};
      }
    }
    return comment;
  }
}
