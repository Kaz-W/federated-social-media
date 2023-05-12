import {DefaultCrudRepository} from '@loopback/repository';
import {LocalKeyPair, LocalKeyPairRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class LocalKeyPairRepository extends DefaultCrudRepository<LocalKeyPair,
  typeof LocalKeyPair.prototype.PubKey,
  LocalKeyPairRelations> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(LocalKeyPair, dataSource);
  }
}
