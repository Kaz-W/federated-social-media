import {
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import getDomain from "../domain";
import {PostRepository, SubforumRepository} from "../repositories";
import {repository} from "@loopback/repository";
import {Post, Subforum} from "../models";

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: PostLinkerInterceptor.BINDING_KEY}})
export class PostLinkerInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${PostLinkerInterceptor.name}`;

  // Additional attributes to the class - set and used for adding links and count

  constructor(
    @repository(SubforumRepository) protected subforumRepository: SubforumRepository,
    @repository(PostRepository) protected postRepository: PostRepository,
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
   * Intercepts the /api/subforums/{id}/posts endpoint.
   *
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Add pre-invocation logic here
      // console.log("PostLinker: " + invocationCtx.args); // debugging
      let result = await next();

      switch (invocationCtx.methodName) {
        // Getting all posts
        case 'find':
          for (let post of result) {
            post = await this.addLinks(post);
          }
          break;
        // Getting/posting/patching a single comment
        case 'findById':
        case 'create':
        case 'updateById':
          let post = result;
          result = this.addLinks(post);
          break;
      }

      return result;
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }

  /**
   * Used to add links to individual Post objects.
   * @param post - Post object to add links to.
   */
  private async addLinks(post: Post) {
    const domain = getDomain();
    const userDomain = post.userDomain ?? getDomain();
    const subforum: Subforum = await this.subforumRepository.findById(post.subforumId);
    const forumId = subforum.forumId;

    post._links = {
      self: {href: `${domain}/api/posts/${post.id}`},
      subforum: {href: `${domain}/api/subforums/${post.subforumId}`},
      forum: {href: `${domain}/api/forums/${forumId}`},
      user: {href: `${userDomain}/api/users/${post.userId}`},
      comments: {href: `${domain}/api/posts/${post.id}/comments`},
    };

    return post;
  }
}
