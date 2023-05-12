import {injectable, Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise,} from '@loopback/core';
import {PostRepository} from "../repositories";
import {repository} from "@loopback/repository";

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: PostCountInterceptor.BINDING_KEY}})
export class PostCountInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${PostCountInterceptor.name}`;

  constructor(
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
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Pre-invocation logic: Get the count as well
      let subforumId = invocationCtx.args[0];
      let where = {subforumId: subforumId};
      let count = (await this.postRepository.count(where)).count;
      // Add post-invocation logic here
      // console.log(count);
      // console.log(result);
      return await next();
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
