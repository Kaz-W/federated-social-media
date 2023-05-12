import {FilterExcludingWhere, repository} from '@loopback/repository';
import {del, get, put, getModelSchemaRef, param, patch, requestBody, RestBindings, HttpErrors, Request} from '@loopback/rest';
import {Post} from '../../models';
import {PostRepository} from '../../repositories';
import {intercept, InvocationContext, service, inject} from '@loopback/core';
import {
  PostLinkerInterceptor,
  RemotePseudoAuthorizer,
  ServerAuthenticationInterceptor,
  MetadataInterceptor,
  UserDomainInterceptor, getKeyId
} from "../../interceptors";
import getDomain from "../../domain";
import {VotingService} from "../../services/voting.service";

@intercept(ServerAuthenticationInterceptor.BINDING_KEY)
export class PostController {
  constructor(
    @repository(PostRepository) public postRepository: PostRepository,
    @service(VotingService) private votingService: VotingService,
  ) {
  }

  @intercept(PostLinkerInterceptor.BINDING_KEY)
  @get('/posts/{id}', {
    responses: {
      '200': {
        description: 'Post model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Post, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Post, {exclude: 'where'}) filter?: FilterExcludingWhere<Post>
  ): Promise<Post> {
    return this.postRepository.findById(id, filter);
  }

  @intercept(RemotePseudoAuthorizer.BINDING_KEY)
  @intercept(MetadataInterceptor.BINDING_KEY)
  @patch('/posts/{id}', {
    responses: {
      '204': {
        description: 'Post PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Post, {partial: true}),
        },
      },
    })
      newPost: Post,
  ): Promise<void> {
    await this.postRepository.updateById(id, newPost);
  }

  @intercept(RemotePseudoAuthorizer.BINDING_KEY)
  @del('/posts/{id}', {
    responses: {
      '204': {
        description: 'Post DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.postRepository.deleteById(id);
  }

  @put('/posts/{id}/vote', {
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
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new HttpErrors.NotFound;
    }

    let user_url = UserDomainInterceptor.getUserDomain(httpReq) + "/api/users/" + user_id

    // Update post with new vote count and user list.
    const newPost = this.votingService.updateVotable(post, user_url, body["isUpvote"]);
    await this.postRepository.updateById(id, newPost);
  }
}
