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

import {UserRepository} from '../../repositories';
import {Role} from "../../models";


@api({basePath: '/internal'})
export class UserRoleController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {
  }

  @get('/users/{id}/roles', {
    responses: {
      '200': {
        description: 'User has many Role',
        content: {
          'application/json': {
            schema: getModelSchemaRef(
              Role),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Role>,
  ): Promise<Role[]> {
    return this.userRepository.roles(id).find(filter);
  }
}