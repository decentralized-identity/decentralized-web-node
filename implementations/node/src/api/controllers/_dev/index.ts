import * as Router from 'koa-router';

const fs = require('fs');
const devRouter = new Router();

devRouter.get('/playground', async ctx => {
  await new Promise((resolve, reject) => {
    fs.readFile('./test/playground/index.html', function(error, content) {
      console.log(error);
      if (error) reject();
      ctx.set('Content-Type', 'text/html');
      ctx.body = content;
      resolve();
    });
  });
});

devRouter.get('/playground/playground.css', async ctx => {
  await new Promise((resolve, reject) => {
    fs.readFile('./test/playground/playground.css', function(error, content) {
      console.log(error);
      if (error) reject();
      ctx.set('Content-Type', 'text/css');
      ctx.body = content;
      resolve();
    });
  });
});

export default devRouter;
