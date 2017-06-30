const Router = require('koa-router');
const indexRouter = new Router();
const extensionsRouter = require('./extensions');
const appConfig = require('../../config/app');

indexRouter.get('/', (ctx, next) => {
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

module.exports = {
  indexRouter,
  extensionsRouter
};
