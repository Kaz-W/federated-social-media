import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false, forceId: true}})
export class Server extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  url: string;

  @property({
    type: 'string',
  })
  publicKey?: string;


  constructor(data?: Partial<Server>) {
    super(data);
  }
}

export interface ServerRelations {
  // describe navigational properties here
}

export type ServerWithRelations = Server & ServerRelations;
