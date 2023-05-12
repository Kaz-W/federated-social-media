import {
  CountSchema,
  repository,
} from '@loopback/repository';
import {
  api,
  get,
  param,
  patch,
  requestBody,
} from '@loopback/rest';
import {UserRepository} from '../../repositories';
import {authorize} from "@loopback/authorization";
import {authenticate} from "@loopback/authentication";
import {User} from "../../models";

@authenticate('jwt')
@api({basePath: '/internal'})
export class UserServerRoleController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {
  }

  @authorize({})
  @patch('/users/{id}/server-role', {
    responses: {
      '204': {
        description: 'User.ServerRole PATCH success',
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: User
        },
      },
    })
      user: Pick<User, "serverRole">,
  ): Promise<void> {
    return this.userRepository.updateById(id, user);
  }

  @get('/users/server-role/{role}')
  async findByRole(
    @param.path.string('role') role: string
  ) {
    return this.userRepository.find({where: {serverRole: role}});
  }
}
