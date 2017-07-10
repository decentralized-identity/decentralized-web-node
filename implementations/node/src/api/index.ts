import * as Koa from 'koa';
const app = new Koa();

import { indexRouter, extensionsRouter } from './controllers';

app
  .use(indexRouter.routes())
  .use(indexRouter.allowedMethods())
  .use(extensionsRouter.routes())
  .use(extensionsRouter.allowedMethods());

export default app;
