// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  juggler,
  repository, HasManyRepositoryFactory, HasManyThroughRepositoryFactory
} from '@loopback/repository';
import {UserServiceBindings} from '../keys';
import {User, UserCredentials, UserRelations, Post, Comment, Role} from '../models';
import {UserCredentialsRepository} from './user-credentials.repository';
import {PostRepository, CommentRepository, RoleRepository, ForumRepository} from '.';

export class UserRepository extends DefaultCrudRepository<User,
  typeof User.prototype.id,
  UserRelations> {
  public readonly userCredentials: HasOneRepositoryFactory<UserCredentials,
    typeof User.prototype.id>;

  public readonly posts: HasManyRepositoryFactory<Post, typeof User.prototype.id>;

  public readonly comments: HasManyRepositoryFactory<Comment, typeof User.prototype.id>;

  public readonly roles: HasManyRepositoryFactory<Role, typeof User.prototype.id>;

  constructor(
    @inject(`datasources.${UserServiceBindings.DATASOURCE_NAME}`)
      dataSource: juggler.DataSource,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>, @repository.getter('PostRepository') protected postRepositoryGetter: Getter<PostRepository>,
    @repository.getter('CommentRepository') protected commentRepositoryGetter: Getter<CommentRepository>,
    @repository.getter('RoleRepository') protected roleRepositoryGetter: Getter<RoleRepository>,
    @repository.getter('ForumRepository') protected forumRepositoryGetter: Getter<ForumRepository>
  ) {
    super(User, dataSource);
    this.roles = this.createHasManyRepositoryFactoryFor('roles', roleRepositoryGetter,);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
    this.comments = this.createHasManyRepositoryFactoryFor('comments', commentRepositoryGetter,);
    this.registerInclusionResolver('comments', this.comments.inclusionResolver);
    this.posts = this.createHasManyRepositoryFactoryFor('posts', postRepositoryGetter,);
    this.registerInclusionResolver('posts', this.posts.inclusionResolver);
    this.userCredentials = this.createHasOneRepositoryFactoryFor(
      'userCredentials',
      userCredentialsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'userCredentials',
      this.userCredentials.inclusionResolver,
    );
  }

  async findCredentials(
    userId: typeof User.prototype.id,
  ): Promise<UserCredentials | undefined> {
    try {
      return await this.userCredentials(userId).get();
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }
}
