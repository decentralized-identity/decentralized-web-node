import * as Koa from 'koa';
import { indexRouter, extensionsRouter } from './controllers';

const app = new Koa();

app
  .use(indexRouter.routes())
  .use(indexRouter.allowedMethods())
  .use(extensionsRouter.routes())
  .use(extensionsRouter.allowedMethods());

export default app;
