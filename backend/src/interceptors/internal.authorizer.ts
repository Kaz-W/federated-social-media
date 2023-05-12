import {injectable, Provider} from "@loopback/core";
import {AuthorizationContext, AuthorizationDecision, AuthorizationMetadata, Authorizer} from "@loopback/authorization";
import {repository} from "@loopback/repository";
import {RoleRepository, SubforumRepository, UserRepository} from "../repositories";
import {RoleEnum} from "../models";

@injectable({tags: {key: InternalAuthorizer.BINDING_KEY}})
export class InternalAuthorizer implements Provider<Authorizer> {
  static readonly BINDING_KEY = `authorizers.${InternalAuthorizer.name}`;

  constructor(
    @repository(UserRepository)
    private userRepository: UserRepository,
    @repository(SubforumRepository)
    private subforumRepository: SubforumRepository,
    @repository(RoleRepository)
    private roleRepository: RoleRepository,
  ) {
  }

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  public async authorize(authorizationCtx: AuthorizationContext, metadata: AuthorizationMetadata) {
    if (await this.isAuthorized(authorizationCtx, metadata)) {
      return AuthorizationDecision.ALLOW;
    } else return AuthorizationDecision.DENY;
  }

  public async isAuthorized(authorizationCtx: AuthorizationContext, metadata: AuthorizationMetadata): Promise<boolean> {
    // ensure that there are principals
    if (authorizationCtx.principals.length == 0) {
      console.error(`Request from ${authorizationCtx.invocationContext.targetName} has no principals. Does the controller have an @authenticate('jwt') annotation?`)
      return false;
    }
    const userId = authorizationCtx.principals[0]?.id;
    const user = await this.userRepository.findById(userId);

    if (user.serverRole == RoleEnum.banned) {
      return false;
    }

    const invocationCtx = authorizationCtx.invocationContext;
    const targetController = invocationCtx.targetName.split(".")[0];
    const objId = invocationCtx.args[0];

    const highAuthLevel = user.serverRole === RoleEnum.admin;

    switch (targetController) {
      case 'ServerController':
        return highAuthLevel;
      case 'InternalForumController':
        return highAuthLevel || (await this.isAdminOfForum(userId, objId));
      case 'InternalSubforumController':
        return highAuthLevel || (this.isAdminOfSubforum(userId, objId));
      case 'RoleController':
        return highAuthLevel || (this.isAdminOfRole(userId, objId));
      case 'UserServerRoleController':
        return highAuthLevel;
      case 'UserInfoController':
        return userId == objId;
      default:
        throw new Error('Unrecognised resource in authorization decorator');
    }
  }

  private async isAdminOfForum(userId: string, forumId: string): Promise<boolean> {
    const roles = await this.userRepository.roles(userId).find();
    return roles.some(role => role.forumId == forumId && role.role == RoleEnum.admin);
  }

  private async isAdminOfSubforum(userId: string, subforumId: string): Promise<boolean> {
    const forum = await this.subforumRepository.forum(subforumId);
    if (forum?.id) {
      return this.isAdminOfForum(userId, forum.id);
    }
    return false;
  }

  private async isAdminOfRole(userId: string, roleId: string): Promise<boolean> {
    const forum = await this.roleRepository.forum(roleId);
    const roles = await this.userRepository.roles(userId).find();
    return roles.some(role => role.forumId == forum.id && role.role == RoleEnum.admin);
  }
}

