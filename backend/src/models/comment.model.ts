import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Post} from './post.model';

@model({settings: {strict: false, forceId: true}})
export class Comment extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  commentContent: string;

  @belongsTo(() => Post)
  postId: string;

  @property({
    type: 'string',
  })
  userId?: string;

  @property({
    type: 'number',
    description: 'Number of upvotes a comment has',
    default: 0
  })
  upvotes: number;

  @property({
    type: 'number',
    description: 'Number of downvotes a comment has',
    default: 0
  })
  downvotes: number;

  @property.array(Object, {
    default: []
  })
  _userVotes: { "isUpvote": boolean, "user": string }[];

  @belongsTo(() => Comment, {name: 'comment'}, {
    type: 'string',
    default: null
  })
  parentCommentId: string;

  @property({
    type: 'string',
    description: 'User domain',
  })
  userDomain: string;

  @property({
    type: 'string'
  })
  username: string;

  @hasMany(() => Comment, {keyTo: 'parentCommentId'})
  comments: Comment[];

  // Define well-known properties here
  // _links?: object;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Comment>) {
    super(data);
  }
}

export interface CommentRelations {
  // describe navigational properties here
}

export type CommentWithRelations = Comment & CommentRelations;
