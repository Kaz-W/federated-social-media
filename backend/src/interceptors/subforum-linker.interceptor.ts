import {injectable, Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise,} from '@loopback/core';
import getDomain from "../domain";

@injectable({tags: {key: SubforumLinkerInterceptor.BINDING_KEY}})
export class SubforumLinkerInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${SubforumLinkerInterceptor.name}`;

  /**
   * This method is used by LoopBack context to produce an interceptor function for the binding.
   */
  value() {
    return this.intercept.bind(this);
  }

  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    const result = await next();

    switch (invocationCtx.methodName) {
      // Getting a single subforum
      case 'findById': {
        const subforum = result as SubforumObject;
        subforum._links = addSubforumLinks(subforum);
        return subforum;
      }

      // Getting all subforums
      case 'find': {
        const embedded = result as SubforumObject[];
        const forumId = invocationCtx.args[0];

        embedded.forEach(function (subforum, index) {
          embedded[index]._links = addSubforumLinks(subforum);
        });

        return {
          _embedded: {
            subforumList: embedded,
          },
          _links: addSubforumWrapperLinks(forumId)
        };
      }
    }

    return result;
  }
}

interface SubforumObject {
  id: string,
  subforumName: string,
  forumId: string,
  _links: object,
}

function addSubforumLinks(subforumObject: SubforumObject) {
  const domain = getDomain();

  return {
    self: {href: `${domain}/api/subforums/${subforumObject.id}`},
    forum: {href: `${domain}/api/forums/${subforumObject.forumId}`},
    posts: {href: `${domain}/api/subforums/${subforumObject.id}/posts`},
  };
}

function addSubforumWrapperLinks(forumId: string) {
  const domain = getDomain();

  return {
    self: {href: `${domain}/api/forums/${forumId}/subforums`}
  }
}


