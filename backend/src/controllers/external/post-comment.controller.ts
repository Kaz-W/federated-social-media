import {
  repository,
} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody
} from '@loopback/rest';
import {Comment, Post,} from '../../models';
import {PostRepository} from '../../repositories';
import {intercept} from '@loopback/core';
import {
  ArrayLinkerInterceptor,
  CommentLinkerInterceptor,
  RemotePseudoAuthorizer,
  ServerAuthenticationInterceptor,
  MetadataInterceptor, UserDomainInterceptor
} from "../../interceptors";

@intercept(ServerAuthenticationInterceptor.BINDING_KEY)
export class PostCommentController {
  constructor(
    @repository(PostRepository) protected postRepository: PostRepository,
  ) {
  }

  @intercept(ArrayLinkerInterceptor.BINDING_KEY, CommentLinkerInterceptor.BINDING_KEY)
  @get('/posts/{id}/comments', {
    responses: {
      '200': {
        description: 'Array of Post has many Comment',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Comment)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.integer('limit') limit?: number,
    @param.query.integer('skip') skip?: number,
    @param.query.string('by') by?: string,
  ): Promise<Comment[]> {
    const orderArr: string[] = [];
    switch (by?.toLowerCase()) {   // Refer back to protocol for sorting cases
      default:
        orderArr.push('createdTime DESC');
    }
    const filter = {
      offset: skip,
      limit: limit,
      order: orderArr,
    }

    const comments = await this.postRepository.comments(id).find(filter);
    return removeNonRoot(comments);
  }

  @intercept(RemotePseudoAuthorizer.BINDING_KEY)
  @intercept(MetadataInterceptor.BINDING_KEY)
  @intercept(UserDomainInterceptor.BINDING_KEY)
  @intercept(CommentLinkerInterceptor.BINDING_KEY)
  @post('/posts/{id}/comments', {
    responses: {
      '200': {
        description: 'Post model instance',
        content: {'application/json': {schema: getModelSchemaRef(Comment)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Post.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Comment, {
            title: 'NewCommentInPost',
            exclude: ['id'],
            optional: ['postId']
          }),
        },
      },
    }) comment: Omit<Comment, 'id'>,
  ): Promise<Comment> {
    comment.postId = id;
    return this.postRepository.comments(id).create(comment);
  }
}

/**
 * Required since loopback can't filter via undefined.
 */
function removeNonRoot(comments: Comment[]) {
  return comments.filter(comment => comment.parentCommentId === undefined || comment.parentCommentId === null);
}
