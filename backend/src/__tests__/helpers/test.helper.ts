import {Cs3099LoopbackApplication} from '../..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import {testdb} from '../fixtures/datasources/testdb.datasource';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the forums configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new Cs3099LoopbackApplication({
    rest: restConfig,
  });

  await app.boot();

  app.dataSource(testdb);

  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: Cs3099LoopbackApplication;
  client: Client;
}
