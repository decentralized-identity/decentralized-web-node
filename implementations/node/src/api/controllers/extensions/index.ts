import * as Router from 'koa-router';
const extensionsRouter = new Router({
  prefix: '/extensions'
});

extensionsRouter.get('extensions', '/', ctx => {
  ctx.body = 'List of all extensions';
});

extensionsRouter.get('extension', '/:id', ctx => {
  const { id } = ctx.params;
  ctx.body = `extension with id: ${id}`;
});

export default extensionsRouter;
