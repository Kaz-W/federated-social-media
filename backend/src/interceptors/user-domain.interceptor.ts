import {
  /* inject, */
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {RestBindings} from "@loopback/rest";
import {getKeyId} from "./server-authentication.interceptor"

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: UserDomainInterceptor.BINDING_KEY}})
export class UserDomainInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${UserDomainInterceptor.name}`;

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

  static getUserDomain(httpReq: any) {
    const pub_key_location = getKeyId(httpReq);
    return (/^(.*)(?=\/api\/key)/).exec(pub_key_location)?.[1];
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
      const httpReq = await invocationCtx.get(RestBindings.Http.REQUEST);
      invocationCtx.args[1].userDomain = UserDomainInterceptor.getUserDomain(httpReq);
      return next();
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
