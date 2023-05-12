import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {Subforum, SubforumRelations, Post, Forum} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {PostRepository} from './post.repository';
import {ForumRepository} from './forum.repository';

export class SubforumRepository extends DefaultCrudRepository<Subforum,
  typeof Subforum.prototype.id,
  SubforumRelations> {

  public readonly posts: HasManyRepositoryFactory<Post, typeof Subforum.prototype.id>;

  public readonly forum: BelongsToAccessor<Forum, typeof Subforum.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('PostRepository') protected postRepositoryGetter: Getter<PostRepository>, @repository.getter('ForumRepository') protected forumRepositoryGetter: Getter<ForumRepository>,
  ) {
    super(Subforum, dataSource);
    this.forum = this.createBelongsToAccessorFor('forum', forumRepositoryGetter,);
    this.registerInclusionResolver('forum', this.forum.inclusionResolver);
    this.posts = this.createHasManyRepositoryFactoryFor('posts', postRepositoryGetter,);
    this.registerInclusionResolver('posts', this.posts.inclusionResolver);
  }
}
