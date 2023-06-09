import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

require("dotenv").config({})
const config = {
  name: 'db',
  connector: 'mongodb',
  url: process.env.DB_URL ?? "",
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ?? 27017,
  user: process.env.DB_USER ?? '',
  password: process.env.DB_PWD ?? '',
  database: 'cs3099_data',
  useNewUrlParser: true,
  authSource: "admin"
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'db';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.db', {optional: true})
      dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
