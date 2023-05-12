import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Forum} from './forum.model';
import {User} from './user.model';

export enum RoleEnum {
  admin = 'admin',
  banned = 'banned'
}

@model()
export class Role extends Entity {

  @property({
    type: 'string',
    id: true
  })
  id: string

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(RoleEnum)
    }
  })
  role: RoleEnum;

  @belongsTo(() => Forum)
  forumId: string;

  @belongsTo(() => User)
  userId: string;

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  // describe navigational properties here
}

export type RoleWithRelations = Role & RoleRelations;
