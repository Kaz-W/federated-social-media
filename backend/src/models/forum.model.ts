import {model, property, hasMany, Entity} from '@loopback/repository';
import {Subforum} from './subforum.model';
import {Role} from './role.model';

@model({settings: {strict: false}})
export class Forum extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  forumName: string;

  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @hasMany(() => Subforum)
  subforums: Subforum[];

  @hasMany(() => Role)
  roles: Role[];
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Forum>) {
    super(data);
  }
}

export interface ForumRelations {
  // describe navigational properties here
}

export type ForumWithRelations = Forum & ForumRelations;
