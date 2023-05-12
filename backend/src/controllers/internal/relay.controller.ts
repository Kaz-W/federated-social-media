import {
  api,
  del,
  get,
  put,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  Response,
  RestBindings,
  response
} from "@loopback/rest";
import axios, {Method} from "axios";
import {Forum, RelayRequest, RoleEnum, TaggableContent, User} from "../../models";
import {inject} from "@loopback/core";
import {authenticate} from "@loopback/authentication";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {TokenServiceBindings} from "../../keys";
import {JWTService} from "../../services";
import getDomain from "../../domain";
import {URL} from "url";
import {generateCertificateHeader} from "../../services/utils"
import {repository} from "@loopback/repository";
import {LocalKeyPairRepository, ServerRepository, UserRepository} from "../../repositories";

/**
 * Controller for allowing the frontend to make secure requests to other foreign servers.
 */
@api({basePath: '/internal'})
export class RelayController {

  private domain = getDomain();

  constructor(
    @repository(ServerRepository) private serverRepository: ServerRepository,
    @repository(UserRepository) private userRepository: UserRepository,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
    @inject(TokenServiceBindings.TOKEN_SERVICE) private jwtService: JWTService,
    @repository(LocalKeyPairRepository) private localKeyPairRepository: LocalKeyPairRepository,
  ) {
  }

  @get('/relay', {
    responses: {
      '200': {
        description: 'Relay GET success'
      }
    }
  })
  async relayGet(
    @param.query.string('relayurl') relayUrl: string
  ): Promise<Response> {
    await this.relay('get', relayUrl, 'ANONYMOUS', undefined);
    return this.response;
  }

  @authenticate('jwt')
  @post('/relay', {
    responses: {
      '200': {
        description: 'Relay POST success'
      }
    }
  })
  async relayPost(
    @requestBody() body: RelayRequest,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<Response> {
    // Automatically add the userId for any POST.
    if (body.content) {
      body.content.userId = currentUserProfile[securityId];
    }
    await this.relay('post', body.url, currentUserProfile[securityId], body?.content);
    return this.response;
  }

  @authenticate('jwt')
  @patch('/relay', {
    responses: {
      '200': {
        description: 'Relay PATCH success'
      }
    }
  })
  async relayPatch(
    @requestBody() body: RelayRequest,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<Response> {
    await this.relay('patch', body.url, currentUserProfile[securityId], body?.content);
    return this.response;
  }


  @authenticate('jwt')
  @put('/relay', {
    responses: {
      '200': {
        description: 'Relay PATCH success'
      }
    }
  })
  async relayPut(
    @requestBody() body: RelayRequest,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<Response> {
    await this.relay('put', body.url, currentUserProfile[securityId], body?.content);

    return this.response;
  }

  @authenticate('jwt')
  @del('/relay', {
    responses: {
      '200': {
        description: 'Relay PATCH success'
      }
    }
  })
  async relayDelete(
    @requestBody() body: RelayRequest,
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<Response> {
    await this.relay('delete', body.url, currentUserProfile[securityId], body?.content);
    return this.response;
  }

  @get('/allforums', {
    responses: {
      '200': {
        description: 'Array of Forum with serverId'
      }
    }
  })
  async getAllForums(): Promise<Forum[]> {
    const servers = await this.serverRepository.find();

    const allForums: Forum[] = [];

    for (const server of servers) {
      try {
        const {status, content} = await this.makeRequest('get', server.url + "/api/forums", "ANONYMOUS", undefined);
        const forums = [];
        for (const forum of content._embedded.forumList) {
          forum.serverId = server.id;
          forums.push(forum);
        }
        allForums.push(...forums);
      } catch {
      }
    }
    return allForums;
  }

  @get('/allusers', {
    responses: {
      '200': {
        description: 'Array of User'
      }
    }
  })
  async getAllUsers(): Promise<User[]> {
    const servers = await this.serverRepository.find();

    const allUsers: User[] = [];

    for (const server of servers) {
      try {
        const {status, content} = await this.makeRequest('get', server.url + "/api/users", "ANONYMOUS", undefined);
        const users = [];
        for (const user of content._embedded.userList) {
          user.serverId = server.id;
          users.push(user);
        }
        allUsers.push(...users);
      } catch {
      }
    }
    return allUsers;
  }

  async makeRequest(method: Method, url: string, userId: string, body?: TaggableContent) {
    if (userId !== 'ANONYMOUS') {
      const user = await this.userRepository.findById(userId);
      if (user.serverRole == RoleEnum.banned) {
        throw new HttpErrors.Forbidden("You are banned from this server");
      }
    }

    const localKeyPair = await this.localKeyPairRepository.findOne()
    if (!localKeyPair) {
      throw new HttpErrors.InternalServerError("Private key not found")
    }
    const privKey = localKeyPair["PrivKey"];
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      throw new HttpErrors.BadRequest(e.toString());
    }
    const target = urlObj.pathname + urlObj.searchParams;
    const {date, signature} = generateCertificateHeader(this.domain, method, target, userId, privKey)
    const res = await axios({
      url: url,
      method: method,
      data: body,
      headers: {
        "user-id": userId,
        "current-date": date,
        "signature": "sig1=:" + signature + ":",
        "signature-input": `sig1=(*request-target, current-date, user-id); keyId=${getDomain()}/api/key; alg=RSASSA-PSS-SHA512`
      }
    });
    // Make sure the root gets the correct data type, otherwise arrays are casted to dictionaries.
    const content = Array.isArray(res.data) ? [...res.data] : {...res.data};
    return {status: res.status, content};
  }

  async relay(method: Method, url: string, userId: string, body?: TaggableContent) {
    try {
      let {status, content} = await this.makeRequest(method, url, userId, body);
      this.response.status(status).send(content);
    } catch (e) {
      throw new HttpErrors.BadGateway(e.message);
    }
  }
}
