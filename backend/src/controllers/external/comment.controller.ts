import {
  Count,
  CountSchema,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  param,
  patch,
  get,
  getModelSchemaRef,
  del,
  requestBody,
  put, HttpErrors, RestBindings, Request,
} from '@loopback/rest';
import {Comment} from '../../models';
import {CommentRepository} from '../../repositories';
import {inject, intercept, service} from '@loopback/core';
import {
  ArrayLinkerInterceptor,
  CommentLinkerInterceptor,
  RemotePseudoAuthorizer,
  ServerAuthenticationInterceptor,
  MetadataInterceptor, UserDomainInterceptor
} from "../../interceptors";
import getDomain from "../../domain";
import {VotingService} from "../../services/voting.service";

@intercept(ServerAuthenticationInterceptor.BINDING_KEY)
export class CommentController {
  constructor(
    @repository(CommentRepository) public commentRepository: CommentRepository,
    @service(VotingService) private votingService: VotingService
  ) {
  }

  @get('/comments/count', {
    responses: {
      '200': {
        description: 'Comment model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(Comment) where?: Where<Comment>,
  ): Promise<Count> {
    return this.commentRepository.count(where);
  }

  @intercept(ArrayLinkerInterceptor.BINDING_KEY, CommentLinkerInterceptor.BINDING_KEY)
  @get('/comments', {
    responses: {
      '200': {
        description: 'Array of Comment model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Comment, {includeRelations: true}),
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
  ): Promise<Comment[]> {
    let orderArr: string[] = [];
    switch (by) {   // Refer back to protocol for sorting cases
      default:
        orderArr.push('createdTime DESC');
        break;
    }
    let filter = {
      'offset': skip,
      'limit': limit,
      'order': orderArr,
    }
    return this.commentRepository.find(filter);
  }

  @intercept(CommentLinkerInterceptor.BINDING_KEY)
  @get('/comments/{id}', {
    responses: {
      '200': {
        description: 'Comment model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Comment, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Comment, {exclude: 'where'}) filter?: FilterExcludingWhere<Comment>
  ): Promise<Comment> {
    return this.commentRepository.findById(id, filter);
  }

  @intercept(MetadataInterceptor.BINDING_KEY, CommentLinkerInterceptor.BINDING_KEY)
  @patch('/comments/{id}', {
    responses: {
      '204': {
        description: 'Comment PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Comment, {partial: true}),
        },
      },
    })
      comment: Comment,
  ): Promise<void> {
    await this.commentRepository.updateById(id, comment);
  }

  @intercept(RemotePseudoAuthorizer.BINDING_KEY)
  @del('/comments/{id}', {
    responses: {
      '204': {
        description: 'Comment DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.commentRepository.deleteById(id);
  }

  @put('/comments/{id}/vote', {
    responses: {
      '200': {
        description: 'Vote successful',
      },
    },
  })
  async voteById(
    @param.path.string('id') id: string,
    @param.header.string('user-id') user_id: string,
    @requestBody({}) body: { "isUpvote": boolean },
    @inject(RestBindings.Http.REQUEST) httpReq: Request
  ): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new HttpErrors.NotFound;
    }

    let user_url = UserDomainInterceptor.getUserDomain(httpReq) + "/api/users/" + user_id;

    // Update the vote count and userVotes of the comment.
    const updatedComment = this.votingService.updateVotable(comment, user_url, body["isUpvote"]);

    await this.commentRepository.updateById(id, updatedComment);
  }
}
