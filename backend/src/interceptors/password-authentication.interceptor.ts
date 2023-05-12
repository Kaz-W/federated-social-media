import {injectable, Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise,} from '@loopback/core';

import {UserRepository} from "../index";
import {repository} from "@loopback/repository";
import {HttpErrors} from "@loopback/rest";

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: PasswordAuthenticationInterceptor.BINDING_KEY}})
export class PasswordAuthenticationInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${PasswordAuthenticationInterceptor.name}`;


  constructor(@repository(UserRepository) protected userRepository: UserRepository) {
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
    // newUserRequest contains relevant info about potential new user; username, password.
    const newUserRequest = invocationCtx.args[0];

    //begin validation
    //query for users with username of potential new user
    let users = await this.userRepository.find({where: {username: newUserRequest.username}});

    // if there already exists a user with that name in the system, user cannot be created.
    if (users.length != 0) {
      throw new HttpErrors.NotAcceptable(
        'Username already taken',
      );
    }

    if (newUserRequest.password.length < 8) {
      throw new HttpErrors.NotAcceptable(
        "Password too short (must be 8 characters or more).",
      );
    }
    // max username length check to make it less difficult to gurantee that UI will display correctly for all usernames
    // (can be problematic if really long usernames are used for things).
    if (newUserRequest.username.length > 15) {
      throw new HttpErrors.NotAcceptable(
        "Username too long, (username cannot be longer than 15 characters).",
      );
    }

    // end validation, if new user request has passed checks, return control to auth controller.
    return next();
  }
}
