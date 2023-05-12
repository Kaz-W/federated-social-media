import {injectable, Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise} from "@loopback/core";
import {DefaultCrudRepository, Repository, repository} from "@loopback/repository";
import {CommentRepository, ForumRepository, PostRepository, SubforumRepository, UserRepository} from "../repositories";
import {HttpErrors, RestBindings} from "@loopback/rest";
import {Forum, Post, RoleEnum, Subforum} from "../models";

@injectable({tags: {key: RemotePseudoAuthorizer.BINDING_KEY}})
export class RemotePseudoAuthorizer implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${RemotePseudoAuthorizer.name}`;

  constructor(
    @repository(UserRepository)
    private userRepository: UserRepository,
    @repository(ForumRepository)
    private forumRepository: ForumRepository,
    @repository(SubforumRepository)
    private subforumRepository: SubforumRepository,
    @repository(PostRepository)
    private postRepository: PostRepository,
    @repository(CommentRepository)
    private commentRepository: CommentRepository
  ) {
  }

  value(): Interceptor {
    return this.intercept.bind(this);
  }

  public async isAuthorized(userId: string, id: string, targetController: string, method: string): Promise<boolean> {

    let repo;
    let forum: Forum;
    let subforum: Subforum;
    let post: Post;
    switch (targetController) {
      case 'PostController':
        repo = this.postRepository;
        post = await this.postRepository.findById(id);
        forum = await this.subforumRepository.forum(post.subforumId);
        break;
      case 'CommentController':
      case 'CommentCommentController':
        repo = this.commentRepository;
        post = await this.commentRepository.post(id);
        forum = await this.subforumRepository.forum(post.subforumId);
        break;
      case 'SubforumPostController':
        subforum = await this.subforumRepository.findById(id);
        forum = await this.forumRepository.findById(subforum.forumId);
        break;
      case 'PostCommentController':
        subforum = await this.postRepository.subforum(id);
        forum = await this.forumRepository.findById(subforum.forumId);
        break;
      default:
        throw new HttpErrors.InternalServerError(`RemotePseudoAuthorizer: Unrecognised controller ${targetController}`);
    }

    switch (method) {
      case 'POST':
        return this.notBanned(userId, forum);
      case 'PATCH':
        if (repo) {
          return this.isCreator(userId, id, repo);
        } else throw new HttpErrors.InternalServerError('RemotePseudoAuthorizer: Invalid PATCH resource');
      case 'DELETE':
        if (repo) {
          return this.isCreator(userId, id, repo) || this.isAdmin(userId, forum);
        } else throw new HttpErrors.InternalServerError('RemotePseudoAuthorizer: Invalid DELETE resource');
      default:
        return true;
    }
  }

  public async intercept(ctx: InvocationContext, next: () => ValueOrPromise<InvocationResult>) {
    const req = await ctx.get(RestBindings.Http.REQUEST);
    if (req) {
      const userId = req.header("user-id");
      if (userId) {
        if (await this.isAuthorized(userId, ctx.args[0], ctx.targetName.split(".")[0], req.method)) {
          return next();
        } else {
          throw new HttpErrors.Forbidden();
        }
      } else {
        throw new HttpErrors.BadRequest("Cannot certify: No 'user-id' header provided.");
      }
    }
  }

  private async notBanned(userId: string, forum: Forum): Promise<boolean> {
    const roles = await this.userRepository.roles(userId).find();
    return !roles.some(role => role.forumId == forum.id && role.role == RoleEnum.banned);
  }

  private async isAdmin(userId: string, forum: Forum): Promise<boolean> {
    const roles = await this.userRepository.roles(userId).find();
    return roles.some(role => role.forumId == forum.id && role.role == RoleEnum.admin);
  }

  private async isCreator(userId: string, id: string, repo: PostRepository | CommentRepository) {
    const content = await repo.findById(id);
    return content.userId === userId;
  }
}
