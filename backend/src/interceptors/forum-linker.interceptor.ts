import {
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import getDomain from "../domain";

@injectable({tags: {key: ForumLinkerInterceptor.BINDING_KEY}})
export class ForumLinkerInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${ForumLinkerInterceptor.name}`;

  /**
   * This method is used by LoopBack context to produce an interceptor function for the binding.
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
    const result = await next();

    switch (invocationCtx.methodName) {
      // Getting a single forum
      case 'findById': {
        const forum = result as ForumObject;
        forum._links = getForumLinks(forum);

        return forum;
      }

      // Getting all forums
      case 'find': {
        const embedded = result as ForumObject[];

        embedded.forEach(function (forum, index) {
          embedded[index]._links = getForumLinks(forum);
        });

        return {
          _embedded: {
            forumList: embedded,
          },
          _links: getWrapperLinks()
        };
      }
    }

    return result;
  }
}

interface ForumObject {
  id: string,
  forumName: string,
  _links: object,
}

function getForumLinks(forumObject: ForumObject) {
  const domain = getDomain();

  return {
    self: {href: `${domain}/api/forums/${forumObject.id}`},
    forums: {href: `${domain}/api/forums`},
    subforums: {href: `${domain}/api/forums/${forumObject.id}/subforums`},
  };
}

function getWrapperLinks() {
  const domain = getDomain();

  return {
    self: {href: `${domain}/api/forums`}
  };
}
