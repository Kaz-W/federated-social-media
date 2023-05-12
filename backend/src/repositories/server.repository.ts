import {DefaultCrudRepository} from '@loopback/repository';
import {Server, ServerRelations} from '../models';
import {DbDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class ServerRepository extends DefaultCrudRepository<Server,
  typeof Server.prototype.id,
  ServerRelations> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Server, dataSource);
  }
}
