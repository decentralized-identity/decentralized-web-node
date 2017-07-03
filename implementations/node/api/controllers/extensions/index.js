const Router = require('koa-router');
const extensionsRouter = new Router({
  prefix: '/extensions'
});

extensionsRouter.get('extensions', '/', (ctx, next) => {
  ctx.body = 'List of all extensions';
});

extensionsRouter.get('extension', '/:id', (ctx, next) => {
  const { id } = ctx.params;
  ctx.body = `extension with id: ${id}`;
});

module.exports = extensionsRouter;
