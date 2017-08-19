import * as Koa from 'koa';
import appConfig from '../config/app';
import { indexRouter, extensionsRouter } from './controllers';

const app = new Koa();
const cors = require('koa2-cors');
const serve = require('koa-static-server');

app
  .use(cors())
  .use(indexRouter.routes())
  .use(indexRouter.allowedMethods())
  .use(extensionsRouter.routes())
  .use(extensionsRouter.allowedMethods());

if (appConfig.environment == 'development') {
  app.use(
    serve({
      rootDir: './test/playground/js',
      rootPath: '/playground/js'
    })
  );

  app.use(
    serve({
      rootDir: './test/playground/css',
      rootPath: '/playground/css'
    })
  );

  app.use(
    serve({
      rootDir: './test/playground',
      rootPath: '/playground',
      index: 'index.html',
      notFoundFile: 'index.html'
    })
  );
}

export default app;
