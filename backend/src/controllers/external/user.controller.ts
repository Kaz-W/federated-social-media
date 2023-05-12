// Copyright IBM Corp. 2020. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  User,
  UserRepository,
} from '../..';
import {
  FilterExcludingWhere,
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
} from '@loopback/rest';
import {intercept} from '@loopback/core';
import {
  ArrayLinkerInterceptor,
  UserLinkerInterceptor,
  RemotePseudoAuthorizer,
  ServerAuthenticationInterceptor
} from "../../interceptors";

@intercept(ServerAuthenticationInterceptor.BINDING_KEY)
export class UserController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {
  }

  // Endpoints from the original CLI
  @intercept(ArrayLinkerInterceptor.BINDING_KEY, UserLinkerInterceptor.BINDING_KEY)
  @get('/users', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.integer('limit') limit?: number,
    @param.query.integer('skip') skip?: number,
    @param.query.string('by') by?: string,
  ): Promise<User[]> {
    let orderArr: string[] = [];
    switch (by?.toLowerCase()) {   // Refer back to protocol for sorting cases
      default:
        orderArr.push('username ASC');
    }
    let filter = {
      'offset': skip,
      'limit': limit,
      'order': orderArr,
    }
    return this.userRepository.find(filter);
  }

  @intercept(UserLinkerInterceptor.BINDING_KEY)
  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

}
