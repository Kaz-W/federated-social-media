import {
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
} from '@loopback/rest';
import {
  Comment
} from '../../models';
import {UserRepository} from '../../repositories';
import {intercept} from '@loopback/core'
import {ArrayLinkerInterceptor, CommentLinkerInterceptor, ServerAuthenticationInterceptor} from "../../interceptors";

@intercept(ServerAuthenticationInterceptor.BINDING_KEY)
@intercept(ArrayLinkerInterceptor.BINDING_KEY, CommentLinkerInterceptor.BINDING_KEY)
export class UserCommentController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {
  }

  @get('/users/{id}/comments', {
    responses: {
      '200': {
        description: 'Array of User has many Comment',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Comment)},
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
  ): Promise<Comment[]> {
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
    return this.userRepository.comments(id).find(filter);
  }
}
