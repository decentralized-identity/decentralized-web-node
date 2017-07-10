import * as Router from 'koa-router';
const indexRouter = new Router();
const appConfig = require('../../config/app');

indexRouter.get('/', ctx => {
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
