import {
  repository,
} from '@loopback/repository';
import {
  api,
  getModelSchemaRef,
  param, patch, requestBody,
} from '@loopback/rest';

import {UserRepository} from '../../repositories';
import {User} from "../../models";
import {authorize} from "@loopback/authorization";
import {authenticate} from "@loopback/authentication";


@api({basePath: '/internal'})
@authenticate('jwt')
export class UserInfoController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {
  }

  @authorize({})
  @patch('/users/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
      newUser: Pick<User, "description" | "profileImageURL">,
  ): Promise<void> {
    await this.userRepository.updateById(id, newUser);
  }
}
