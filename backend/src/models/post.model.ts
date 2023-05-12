import {Entity, model, property, hasMany, belongsTo} from '@loopback/repository';
import {Comment} from './comment.model';
import {User} from './user.model';
import {Subforum} from "./subforum.model";

class Vote {
  isUpvote: boolean;
  user: string;
}

@model({
  settings: {
    strict: false,    // Makes this an open model, accepting all properties, including ones not predefined in the model. Useful to store free-form JSON data to a schema-less database such as MongoDB and supported by such databases only.
    forceId: true,    // Prevents clients from setting the auto-generated ID value manually.
    // Consider setting a scope for any operation to avoid deleted posts, etc. https://loopback.io/doc/en/lb4/Model.html#scope
  },
})
export class Post extends Entity {
  @property({
    type: 'string',   // overridden by 'generated'; MongoDB automatically generates an ID value with default type string.
    id: true,
    generated: true,
    description: 'The unique identifier for posts',
  })
  id: string;

  @property({
    type: 'string',
    required: true,
    description: 'Title of post',   // perhaps a limitation on its length? e.g. see commented code below; see also https://loopback.io/doc/en/lb4/Parsing-requests.html#request-body
    // jsonSchema: {
    //   minLength: 3,
    //   maxLength: 20,
    //   errorMessage: 'Title should be between 3 and 20 characters.',
    // },
  })
  postTitle: string;

  @property({
    type: 'number',
    description: 'Number of upvotes a post has',
    default: 0
  })
  upvotes: number;

  @property({
    type: 'number',
    description: 'Number of downvotes a post has',
    default: 0
  })
  downvotes: number;

  @property.array(Object, {
    default: []
  })
  _userVotes: { "isUpvote": boolean, "user": string }[];

  @property({
    type: 'string',
    description: 'Contents of a post, in markdown',   // limitation on its length?
  })
  postContents: string;

  @property({
    type: 'string',
    description: 'Post type is Markdown',
    default: 'markdown'
  })
  postType: string;


  // Create a link generator service and delegate link handling to it?
  @hasMany(() => Comment)
  comments: Comment[];

  @belongsTo(() => User)
  userId: string;

  @belongsTo(() => Subforum)
  subforumId: string;

  @property({
    type: 'string',
    description: 'User domain',
  })
  userDomain: string;

  @property({
    type: 'string'
  })
  username: string;

  // Define well-known properties here
  // _links?: object;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Post>) {
    super(data);
  }
}

export interface PostRelations {
  // describe navigational properties here
}

export type PostWithRelations = Post & PostRelations;
