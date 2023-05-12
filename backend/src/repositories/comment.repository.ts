import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {Comment, CommentRelations, Post} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {PostRepository} from './post.repository';

export class CommentRepository extends DefaultCrudRepository<Comment,
  typeof Comment.prototype.id,
  CommentRelations> {

  public readonly post: BelongsToAccessor<Post, typeof Comment.prototype.id>;

  public readonly comments: HasManyRepositoryFactory<Comment, typeof Comment.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('PostRepository') protected postRepositoryGetter: Getter<PostRepository>,
  ) {
    super(Comment, dataSource);
    this.post = this.createBelongsToAccessorFor('post', postRepositoryGetter,);
    this.comments = this.createHasManyRepositoryFactoryFor(
      'comments',
      Getter.fromValue(this)
    )
    this.registerInclusionResolver('comments', this.comments.inclusionResolver);
  }
}
