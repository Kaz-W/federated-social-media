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
import {User} from "../models";

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: UserLinkerInterceptor.BINDING_KEY}})
export class UserLinkerInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${UserLinkerInterceptor.name}`;

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
      // console.log("UserLinker: " + invocationCtx.args); // debugging
      let result = await next();

      switch (invocationCtx.methodName) {
        // Getting a single user
        case 'findById':
        case 'whoAmIUsername':
          result = this.addLinks(result);
          break;

        // Getting all users
        case 'find':
          for (let user of result) {
            user = this.addLinks(user);
          }
          break;
      }
      return result;

    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }

  /**
   * Adds links to a user.
   * @param userObject
   * @private
   */
  private addLinks(userObject: User) {
    const domain = getDomain();

    userObject._links = {
      self: {href: `${domain}/api/users/${userObject.id}`},
      posts: {href: `${domain}/api/users/${userObject.id}/posts`},
      comments: {href: `${domain}/api/users/${userObject.id}/comments`},
      users: {href: `${domain}/api/users`},
    };

    return userObject;
  }
}

