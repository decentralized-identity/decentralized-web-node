const Koa = require('koa');
const app = new Koa();

const { indexRouter, extensionsRouter } = require('./controllers');

app
  .use(indexRouter.routes())
  .use(indexRouter.allowedMethods())
  .use(extensionsRouter.routes())
  .use(extensionsRouter.allowedMethods());

module.exports = app;
