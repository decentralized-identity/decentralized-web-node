import * as Router from 'koa-router';
const storesRouter = new Router();

storesRouter.get('/.identity/:id/stores', ctx => {
  const { id } = ctx.params;
  ctx.body = `GET the Store assigned to the DID: ${id}`;
});

export default storesRouter;
