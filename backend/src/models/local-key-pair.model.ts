import {Entity, model, property} from '@loopback/repository';

@model()
export class LocalKeyPair extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  PubKey: string;

  @property({
    type: 'string',
    required: true,
  })
  PrivKey: string;


  constructor(data?: Partial<LocalKeyPair>) {
    super(data);
  }
}

export interface LocalKeyPairRelations {
  // describe navigational properties here
}

export type LocalKeyPairWithRelations = LocalKeyPair & LocalKeyPairRelations;
