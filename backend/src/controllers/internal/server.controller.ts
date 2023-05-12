import {
  Filter,
  FilterExcludingWhere,
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  put,
  del,
  requestBody, patch,
} from '@loopback/rest';
import {Post, Server} from '../../models';
import {ServerRepository, UserRepository} from '../../repositories';
import {authenticate} from "@loopback/authentication";
import {authorize} from "@loopback/authorization";


@authenticate('jwt')
@authorize({})
export class ServerController {
  constructor(
    @repository(ServerRepository)
    public serverRepository: ServerRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {
  }


  // Server URLs should include http(s) and does not end with a slash (without the '/api').
  // e.g. http://localhost:3000
  @post('/servers', {
    responses: {
      '200': {
        description: 'Server model instance',
        content: {'application/json': {schema: getModelSchemaRef(Server)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Server, {
            title: 'NewServer',
            exclude: ['id'],
          }),
        },
      },
    })
      server: Omit<Server, 'id'>,
  ): Promise<Server> {
    return this.serverRepository.create(server);
  }

  @authenticate.skip()
  @authorize.skip()
  @get('/servers', {
    responses: {
      '200': {
        description: 'Array of Server model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Server, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Server) filter?: Filter<Server>,
  ): Promise<Server[]> {
    return this.serverRepository.find(filter);
  }

  @get('/servers/{id}', {
    responses: {
      '200': {
        description: 'Server model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Server, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Server, {exclude: 'where'}) filter?: FilterExcludingWhere<Server>
  ): Promise<Server> {
    return this.serverRepository.findById(id, filter);
  }

  @del('/servers/{id}', {
    responses: {
      '204': {
        description: 'Server DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.serverRepository.deleteById(id);
  }
}
