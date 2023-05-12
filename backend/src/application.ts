import {AuthorizationTags} from "@loopback/authorization";
import {KeyGen, KeyRegen} from "./key-regen";

const path = require('path')
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {Request, Response, RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
//import path from 'path';
import {MySequence} from './sequence';
import morgan from "morgan";

// AUTHENTICATION STUFFS

import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  UserServiceBindings,
} from './';
import {DbDataSource} from './datasources';
import {InternalAuthorizer} from "./interceptors/internal.authorizer";
import {CronComponent} from '@loopback/cron';
import {PostmanTestHelper} from './postman-test-helper';
import * as fs from "fs";

require('dotenv').config({});


export {ApplicationConfig};

export class Cs3099LoopbackApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up lifecycle scripts and cron job
    this.component(CronComponent);
    this.add(createBindingFromClass(KeyGen));
    this.add(createBindingFromClass(KeyRegen));
    this.add(createBindingFromClass(PostmanTestHelper));

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'), {});

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
    // ------ ADD SNIPPET AT THE BOTTOM ---------
    // Mount authentication system
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);

    // Bind datasource
    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);
    this.bind('authorizers.InternalAuthorizer')
      .toProvider(InternalAuthorizer)
      .tag(AuthorizationTags.AUTHORIZER);

    // ------------- END OF SNIPPET -------------

    const logStream = fs.createWriteStream('public/access.log', {flags: 'a'});
    const loggerFactory = (config?: morgan.Options<Request, Response>) => morgan('combined', config);
    this.expressMiddleware(loggerFactory,
      {
        stream: logStream
      }, {
        injectConfiguration: "watch",
        key: "middleware.morgan"
      });

  }
}


