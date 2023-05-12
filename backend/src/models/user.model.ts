// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, hasOne, model, property, hasMany} from '@loopback/repository';
import {UserCredentials} from './user-credentials.model';
import {Post} from './post.model';
import {Comment} from './comment.model';
import {Role, RoleEnum} from './role.model';

@model({
  settings: {
    strict: false,
  },
})
export class User extends Entity {
  // must keep it
  // add id:string<UUID>
  @property({
    type: 'string',
    id: true,
    generated: false,
    defaultFn: 'uuidv4',
  })
  id: string;


  // must keep it
  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string'
  })
  serverRole?: RoleEnum;

  @property({
    type: 'string',
    description: "The user's profile description",
    required: false
  })
  description?: string;

  @property({
    type: 'string',
    description: "Link to the user's profile image",
    required: false
  })
  profileImageURL?: string;

  @hasOne(() => UserCredentials)
  userCredentials: UserCredentials;

  @hasMany(() => Post)
  posts: Post[];

  @hasMany(() => Comment)
  comments: Comment[];

  @hasMany(() => Role)
  roles: Role[];

  [prop: string]: any;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
