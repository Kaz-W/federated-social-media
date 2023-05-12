import {Entity, model, property} from "@loopback/repository";

/**
 * Transient (not stored, no ID) model for parsing the request body of a relay request.
 */

@model({settings: {strict: false}})
export class TaggableContent extends Entity {

  @property({
    type: 'string',
    required: false
  })
  userId?: string;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<TaggableContent>) {
    super(data);
  }
}

@model()
export class RelayRequest extends Entity {

  @property({
    type: 'string',
    required: true
  })
  url: string;

  @property()
  content?: TaggableContent;

  constructor(data: Partial<RelayRequest>) {
    super(data);
  }
}
