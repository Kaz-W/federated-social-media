import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {Post, PostRelations, Comment, User, Subforum} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {CommentRepository} from './comment.repository';
import {UserRepository} from './user.repository';
import {SubforumRepository} from './subforum.repository';

export class PostRepository extends DefaultCrudRepository<Post,
  typeof Post.prototype.id,
  PostRelations> {

  public readonly comments: HasManyRepositoryFactory<Comment, typeof Post.prototype.id>;

  public readonly user: BelongsToAccessor<User, typeof Post.prototype.id>;

  public readonly subforum: BelongsToAccessor<Subforum, typeof Post.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('CommentRepository') protected commentRepositoryGetter: Getter<CommentRepository>,
    @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('SubforumRepository') protected subforumRepositoryGetter: Getter<SubforumRepository>,
  ) {
    super(Post, dataSource);
    this.subforum = this.createBelongsToAccessorFor('subforum', subforumRepositoryGetter);
    this.registerInclusionResolver('subforum', this.subforum.inclusionResolver);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.comments = this.createHasManyRepositoryFactoryFor('comments', commentRepositoryGetter,);
    this.registerInclusionResolver('comments', this.comments.inclusionResolver);
  }
}
