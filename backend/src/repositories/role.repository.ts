import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Role, RoleRelations, Forum, User} from '../models';
import {ForumRepository} from './forum.repository';
import {UserRepository} from './user.repository';

export class RoleRepository extends DefaultCrudRepository<Role,
  typeof Role.prototype.id,
  RoleRelations> {

  public readonly forum: BelongsToAccessor<Forum, typeof Role.prototype.id>;

  public readonly user: BelongsToAccessor<User, typeof Role.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ForumRepository') protected forumRepositoryGetter: Getter<ForumRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Role, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.forum = this.createBelongsToAccessorFor('forum', forumRepositoryGetter,);
    this.registerInclusionResolver('forum', this.forum.inclusionResolver);
  }
}
