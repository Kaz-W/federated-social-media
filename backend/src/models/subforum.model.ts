import {Entity, Model, model, property, hasMany, belongsTo} from '@loopback/repository';
import {Post} from './post.model';
import {Forum} from './forum.model';

@model({settings: {strict: false}})
export class Subforum extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  subforumName: string;

  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;
  @hasMany(() => Post)
  posts: Post[];

  @belongsTo(() => Forum)
  forumId: string;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Subforum>) {
    super(data);
  }
}

export interface SubforumRelations {
  // describe navigational properties here
}

export type SubforumWithRelations = Subforum & SubforumRelations;
