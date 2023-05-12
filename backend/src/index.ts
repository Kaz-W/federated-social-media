import {ApplicationConfig, Cs3099LoopbackApplication} from './application';
import {
  AuthorizationBindings,
  AuthorizationComponent,
  AuthorizationDecision,
  AuthorizationOptions
} from "@loopback/authorization";

export * from './application';
export * from './jwt-authentication-component';
export * from './keys';
export * from './models';
export * from './repositories';
export * from './services';
export * from './types';

export async function main(options: ApplicationConfig = {}) {
  const app = new Cs3099LoopbackApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  const authOptions: AuthorizationOptions = {
    precedence: AuthorizationDecision.DENY,
    defaultDecision: AuthorizationDecision.DENY,
  };

  app.configure(AuthorizationBindings.COMPONENT).to(authOptions);
  app.component(AuthorizationComponent);

  // ServerRepository.create({process.env.SERVER_URL});

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      basePath: '/api',
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // forums with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
