import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {Forum, ForumRelations, Subforum, Role} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {SubforumRepository} from './subforum.repository';
import {RoleRepository} from './role.repository';

export class ForumRepository extends DefaultCrudRepository<Forum,
  typeof Forum.prototype.id,
  ForumRelations> {

  public readonly subforums: HasManyRepositoryFactory<Subforum, typeof Forum.prototype.id>;

  public readonly roles: HasManyRepositoryFactory<Role, typeof Forum.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('SubforumRepository') protected subforumRepositoryGetter: Getter<SubforumRepository>, @repository.getter('RoleRepository') protected roleRepositoryGetter: Getter<RoleRepository>,
  ) {
    super(Forum, dataSource);
    this.roles = this.createHasManyRepositoryFactoryFor('roles', roleRepositoryGetter,);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
    this.subforums = this.createHasManyRepositoryFactoryFor('subforums', subforumRepositoryGetter,);
    this.registerInclusionResolver('subforums', this.subforums.inclusionResolver);
  }
}
