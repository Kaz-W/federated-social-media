import {
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
} from '@loopback/rest';
import {
  Post
} from '../../models';
import {UserRepository} from '../../repositories';
import {intercept} from '@loopback/core'
import {ArrayLinkerInterceptor, PostLinkerInterceptor, ServerAuthenticationInterceptor} from "../../interceptors";

@intercept(ServerAuthenticationInterceptor.BINDING_KEY)
@intercept(PostLinkerInterceptor.BINDING_KEY)
export class UserPostController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {
  }

  @intercept(ArrayLinkerInterceptor.BINDING_KEY, PostLinkerInterceptor.BINDING_KEY)
  @get('/users/{id}/posts', {
    responses: {
      '200': {
        description: 'Array of User has many Post',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Post)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.integer('limit') limit?: number,
    @param.query.integer('skip') skip?: number,
    @param.query.string('by') by?: string,
  ): Promise<Post[]> {
    let orderArr: string[] = [];
    switch (by?.toLowerCase()) {   // Refer back to protocol for sorting cases
      default:
        orderArr.push('createdTime DESC');
    }
    let filter = {
      'offset': skip,
      'limit': limit,
      'order': orderArr,
    }
    return this.userRepository.posts(id).find(filter);
  }
}
