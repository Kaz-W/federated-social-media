// Node module: @loopback/example-todo-jwt
import {TokenServiceBindings, UserServiceBindings} from "@loopback/authentication-jwt";
import {get, HttpErrors, post, requestBody, SchemaObject} from "@loopback/rest";
import {authenticate, TokenService} from "@loopback/authentication";
import {inject, intercept} from "@loopback/core";
import {SecurityBindings, securityId, UserProfile} from "@loopback/security";
import {genSalt, hash} from "bcryptjs";
import _ from "lodash";
import {model, property, repository} from "@loopback/repository";
import {Credentials, MyUserService, RoleEnum, User, UserRepository} from "../../index";
import {PasswordAuthenticationInterceptor, MetadataInterceptor, UserLinkerInterceptor} from "../../interceptors";

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
  })
  password: string;
}

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
      // taking this out from here because this condition catches
      // passwords too short before the interceptor and I literally cannot
      // workout where it does this. Instead, password length checked in
      // password-authenticator.interceptor... - Kaz
      //minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};


export class AuthController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {
  }

  @post('/signin', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{ token: string }> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    if (user.serverRole == RoleEnum.banned) {
      throw new HttpErrors.Forbidden('You are banned from this server');
    }
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return {token};
  }

  @intercept(UserLinkerInterceptor.BINDING_KEY)
  @authenticate('jwt')
  @get('/whoAmI', {
    responses: {
      '200': {
        description: 'Return current user',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmI(
    @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
  ): Promise<string> {
    return currentUserProfile[securityId];
  }

  @intercept(UserLinkerInterceptor.BINDING_KEY)
  @authenticate('jwt')
  @get('/whoAmIUsername', {
    responses: {
      '200': {
        description: 'Return current user username from ID',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async whoAmIUsername(
    @inject(SecurityBindings.USER)
      currentUserProfile: UserProfile,
  ): Promise<User> {
    return this.userRepository.findById(currentUserProfile[securityId]);
  }

  @post('/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  // interceptor to validate user request
  @intercept(PasswordAuthenticationInterceptor.BINDING_KEY)
  @intercept(MetadataInterceptor.BINDING_KEY)   // for adding a creation date
  async signUp(
    @requestBody(CredentialsRequestBody) newUserRequest: NewUserRequest):
    Promise<{ status: string, message: string }> {

    const password = await hash(newUserRequest.password, await genSalt());
    const savedUser = await this.userRepository.create(
      _.omit(newUserRequest, ['password', 'serverRole'])
    );

    await this.userRepository.userCredentials(savedUser.id).create({password});
    return {status: "Success", message: "New user created."}
  }
}
