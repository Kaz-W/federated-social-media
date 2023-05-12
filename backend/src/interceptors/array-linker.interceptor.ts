import {
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import getDomain from "../domain";
import {RestBindings} from "@loopback/rest";
import {repository} from "@loopback/repository";
import {CommentRepository, PostRepository, UserRepository} from "../repositories";

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: ArrayLinkerInterceptor.BINDING_KEY}})
export class ArrayLinkerInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${ArrayLinkerInterceptor.name}`;

  constructor(
    @repository(PostRepository) protected postRepository: PostRepository,
    @repository(CommentRepository) protected commentRepository: CommentRepository,
    @repository(UserRepository) protected userRepository: UserRepository,
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
    try {
      // Add pre-invocation logic here
      let result = await next();

      // update this if findById only
      if (invocationCtx.methodName === 'find') {
        result = (await this.addArrayLinks(result, invocationCtx));
      }
      return result;

    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }


  /**
   * Adds links and a TotalCount to an array of objects.
   * @param array - The array of objects from the result query.
   * @param ctx - Invocation context to find the caller.
   */
  private async addArrayLinks(array: Array<any>, ctx: InvocationContext) {
    const domain = getDomain()
    const req = await ctx.get(RestBindings.Http.REQUEST);
    let listName = "list";
    let count = -1;     // Sets totalCount to -1 by default if no matches with the caller

    const caller = ctx.targetName.split(".")[0];  // janky way of getting the caller

    switch (caller) {
      case "UserPostController":
        listName = "postList";
        count = (await this.postRepository.count({userId: ctx.args[0]})).count; // Count object has 'count' property
        break;
      case "SubforumPostController":
        listName = "postList";
        count = (await this.postRepository.count({subforumId: ctx.args[0]})).count;
        break;
      case "UserCommentController":
        listName = "commentList";
        count = (await this.commentRepository.count({userId: ctx.args[0]})).count;
        break;
      case "PostCommentController":
        listName = "commentList";
        count = (await this.commentRepository.count({postId: ctx.args[0]})).count;
        break;
      case "CommentCommentController":
        listName = "commentList";
        count = (await this.commentRepository.count({parentCommentId: ctx.args[0]})).count;
        break;
      case "UserController":
        listName = "userList";
        count = (await this.userRepository.count()).count;
        break;
      default:
        break;
    }

    return {
      _embedded: {
        totalCount: count,
        [listName]: array
      },
      _links: {
        self: {href: domain + req.originalUrl}
      }
    }
  }
}
