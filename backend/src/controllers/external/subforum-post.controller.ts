import {
  repository,
  Where
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,       // required, even though WebStorm says 'unused'
  requestBody,
} from '@loopback/rest';
import {
  Subforum,
  Post,
} from '../../models';
import {SubforumRepository} from '../../repositories';
import {intercept} from "@loopback/core";
import {
  ArrayLinkerInterceptor,
  PostLinkerInterceptor,
  RemotePseudoAuthorizer,
  ServerAuthenticationInterceptor,
  MetadataInterceptor, UserDomainInterceptor
} from "../../interceptors";

@intercept(ServerAuthenticationInterceptor.BINDING_KEY)
export class SubforumPostController {
  constructor(
    @repository(SubforumRepository) protected subforumRepository: SubforumRepository,
  ) {
  }

  @intercept(ArrayLinkerInterceptor.BINDING_KEY, PostLinkerInterceptor.BINDING_KEY)
  @get('/subforums/{id}/posts', {
    responses: {
      '200': {
        description: 'Array of Subforum has many Post',
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
    @param.where(Post) where?: Where<Post>,
  ): Promise<Post[]> {
    let orderArr: string[] = [];
    switch (by?.toLowerCase()) {   // Refer back to protocol for sorting cases
      case 'oldest':
        orderArr.push('createdTime ASC');
        break;
      default:
        orderArr.push('createdTime DESC');
    }
    let filter = {
      'offset': skip,
      'limit': limit,
      'order': orderArr,
    }
    return this.subforumRepository.posts(id).find(filter);
  }

  @intercept(RemotePseudoAuthorizer.BINDING_KEY,
    MetadataInterceptor.BINDING_KEY,
    UserDomainInterceptor.BINDING_KEY,
    PostLinkerInterceptor.BINDING_KEY)
  @post('/subforums/{id}/posts', {
    responses: {
      '200': {
        description: 'Post model instance',
        content: {'application/json': {schema: getModelSchemaRef(Post)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Subforum.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Post, {
            title: 'NewPostInSubforum',
            exclude: ['id'],
            optional: ['subforumId']
          }),
        },
      },
    }) post: Omit<Post, 'id'>,
  ): Promise<Post> {
    return this.subforumRepository.posts(id).create(post);
  }
}
