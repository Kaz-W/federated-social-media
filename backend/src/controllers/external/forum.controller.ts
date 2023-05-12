import {
  Filter,
  FilterExcludingWhere,
  repository,
  Count,
  CountSchema,
  Where
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {Forum} from '../../models';
import {ForumRepository} from '../../repositories';
import {intercept} from "@loopback/core";
import {ForumLinkerInterceptor, ServerAuthenticationInterceptor} from "../../interceptors";

export class ForumController {
  constructor(
    @repository(ForumRepository)
    public forumRepository: ForumRepository,
  ) {
  }

  @intercept(ServerAuthenticationInterceptor.BINDING_KEY)
  @get('/forums/count', {
    responses: {
      '200': {
        description: 'Forum model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Forum) where?: Where<Forum>,
  ): Promise<Count> {
    return this.forumRepository.count(where);
  }

  @intercept(ForumLinkerInterceptor.BINDING_KEY)
  @get('/forums', {
    responses: {
      '200': {
        description: 'Array of Forum model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Forum, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Forum) filter?: Filter<Forum>,
  ): Promise<Forum[]> {
    return this.forumRepository.find(filter);
  }

  @intercept(ForumLinkerInterceptor.BINDING_KEY)
  @get('/forums/{id}', {
    responses: {
      '200': {
        description: 'Forum model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Forum, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Forum, {exclude: 'where'}) filter?: FilterExcludingWhere<Forum>
  ): Promise<Forum> {
    return this.forumRepository.findById(id, filter);
  }
}
