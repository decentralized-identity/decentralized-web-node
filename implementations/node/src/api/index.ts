import * as Koa from 'koa';
import appConfig from '../config/app';
import { indexRouter, extensionsRouter, devRouter } from './controllers';

const app = new Koa();
const cors = require('koa2-cors');

app
  .use(cors())
  .use(indexRouter.routes())
  .use(indexRouter.allowedMethods())
  .use(extensionsRouter.routes())
  .use(extensionsRouter.allowedMethods());

if (appConfig.environment == 'development') {
  app.use(devRouter.routes()).use(devRouter.allowedMethods());
}

export default app;
