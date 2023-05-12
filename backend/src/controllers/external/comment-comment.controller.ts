/**
 * Yes I know it's a dumb name, but this controller supports nested comment endpoints.
 */
import {CommentRepository} from "../../repositories";
import {repository} from "@loopback/repository";
import {get, getModelSchemaRef, param, post, requestBody} from "@loopback/rest";
import {Comment} from "../../models";
import {intercept} from "@loopback/core";
import {
  ServerAuthenticationInterceptor,
  CommentLinkerInterceptor,
  RemotePseudoAuthorizer,
  ArrayLinkerInterceptor, MetadataInterceptor, UserDomainInterceptor
} from "../../interceptors";

@intercept(ServerAuthenticationInterceptor.BINDING_KEY)
export class CommentCommentController {

  private commentRepository: CommentRepository;

  constructor(
    @repository(CommentRepository) commentRepository: CommentRepository
  ) {
    this.commentRepository = commentRepository;
  }

  @intercept(RemotePseudoAuthorizer.BINDING_KEY)
  @intercept(MetadataInterceptor.BINDING_KEY)
  @intercept(UserDomainInterceptor.BINDING_KEY)
  @intercept(CommentLinkerInterceptor.BINDING_KEY)
  @post('/comments/{id}/comments', {
    responses: {
      '200': {
        description: 'Comment model instance' /* ? */,
        content: {'application/json': {schema: getModelSchemaRef(Comment)}},
      }
    }
  })
  async create(
    @param.path.string('id') id: typeof Comment.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Comment, {
            title: 'NewCommentInComment',
            exclude: ['id'],
            optional: ['postId']
          }),
        },
      },
    }) comment: Omit<Comment, 'id'>,
  ): Promise<Comment> {
    const parent = await this.commentRepository.findById(id);
    comment.postId = parent.postId;
    return this.commentRepository.comments(id).create(comment);
  }

  @intercept(ArrayLinkerInterceptor.BINDING_KEY, CommentLinkerInterceptor.BINDING_KEY)
  @get('/comments/{id}/comments', {
    responses: {
      '200': {
        description: 'Array of child comments',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Comment)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: typeof Comment.prototype.id
  ): Promise<Comment[]> {
    return this.commentRepository.comments(id).find();
  }
}
