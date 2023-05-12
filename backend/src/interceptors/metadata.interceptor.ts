import {injectable, Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise,} from '@loopback/core';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: MetadataInterceptor.BINDING_KEY}})
export class MetadataInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${MetadataInterceptor.name}`;

  /*
  constructor() {}
  */

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

      // for reference, the 'args' property of invocationCtx upon post creation:
      // args: [
      //   '6003268496418014d85d1f9e',
      //   {
      //     postTitle: 'post number 3',
      //     postContents: 'content 3',
      //     userId: '8acc49b1-1119-497e-8bcc-03df64135d3d'
      //   }
      // ]

      // Post/Comment creation: Add a createdTime and modifiedTime
      if (invocationCtx.methodName === 'create') {
        let timestamp = Date.now()
        invocationCtx.args[1]['upvotes'] = 0;
        invocationCtx.args[1]['_userVotes'] = [];
        invocationCtx.args[1]['createdTime'] = timestamp;
        invocationCtx.args[1]['modifiedTime'] = timestamp;

        // Post/Comment update through PATCH: Include modifiedTime
      } else if (invocationCtx.methodName === 'updateById') {
        invocationCtx.args[1]['modifiedTime'] = Date.now();

        // User creation - add on a createdTime to save the creation date of a profile
      } else if (invocationCtx.methodName === 'signUp') {
        invocationCtx.args[0]['createdTime'] = Date.now();
      }

      // Add post-invocation logic here
      return next();

    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
