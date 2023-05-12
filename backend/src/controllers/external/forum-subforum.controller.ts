import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Subforum,
  Forum
} from '../../models';
import {ForumRepository} from '../../repositories';
import {intercept} from "@loopback/core";
import {
  ServerAuthenticationInterceptor,
  SubforumLinkerInterceptor
} from "../../interceptors";

@intercept(ServerAuthenticationInterceptor.BINDING_KEY, SubforumLinkerInterceptor.BINDING_KEY)
export class ForumSubforumController {
  constructor(
    @repository(ForumRepository) protected forumRepository: ForumRepository
  ) {
  }

  @get('/forums/{id}/subforums', {
    responses: {
      '200': {
        description: 'Array of Forum has many Subforum',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Subforum)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Subforum>,
  ): Promise<Subforum[]> {
    return this.forumRepository.subforums(id).find(filter);
  }

  @post('/forums/{id}/subforums', {
    responses: {
      '200': {
        description: 'Forum model instance',
        content: {'application/json': {schema: getModelSchemaRef(Subforum)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Forum.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Subforum, {
            title: 'NewSubforumInForum',
            exclude: ['id'],
            optional: ['forumId']
          }),
        },
      },
    }) subforum: Omit<Subforum, 'id'>,
  ): Promise<Subforum> {
    return this.forumRepository.subforums(id).create(subforum);
  }
}
