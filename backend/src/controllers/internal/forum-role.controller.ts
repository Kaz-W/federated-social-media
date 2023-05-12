import {
  Filter,
  repository,
} from '@loopback/repository';
import {
  api,
  get,
  getModelSchemaRef,
  param,
} from '@loopback/rest';
import {
  Role,
} from '../../models';
import {ForumRepository} from '../../repositories';


@api({basePath: '/internal'})
export class ForumRoleController {
  constructor(
    @repository(ForumRepository) protected forumRepository: ForumRepository,
  ) {
  }

  @get('/forums/{id}/roles', {
    responses: {
      '200': {
        description: 'Forum has many Role',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Role),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Role>,
  ): Promise<Role[]> {
    return this.forumRepository.roles(id).find(filter);
  }
}