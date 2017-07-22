import * as Router from 'koa-router';
import resolver from '../../resolver';
const indexRouter = new Router();
const appConfig = require('../../config/app');

indexRouter.get('/:id', function(ctx) {
  // Ensure that there is an ID passed to the Hub

  resolver.resolve(this.params.id).then(response => {});

  ctx.body = JSON.stringify({
    routes: {
      extensions: {
        extensions: {
          rel: 'extension',
          href: appConfig.baseURL + '/extensions',
          action: 'GET'
        },
        extension: {
          rel: 'extension',
          href: appConfig.baseURL + '/extension/:id',
          action: 'GET'
        }
      }
    }
  });
});

import extensionsRouter from './extensions';
export { indexRouter, extensionsRouter };
